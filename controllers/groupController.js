import Group from '../models/Group.js';
import Question from '../models/Question.js';
import User from '../models/User.js';

// @desc    Get all groups with search and pagination
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        let query = { isActive: true };

        // Add search functionality
        if (search) {
            query.$text = { $search: search };
        }

        const groups = await Group.find(query)
            .populate('createdBy', 'username profile.fullName')
            .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('name description memberCount createdBy createdAt tags');

        const totalGroups = await Group.countDocuments(query);
        const totalPages = Math.ceil(totalGroups / limit);

        res.status(200).json({
            success: true,
            data: {
                groups: groups.map(group => ({
                    id: group._id,
                    name: group.name,
                    description: group.description,
                    memberCount: group.memberCount,
                    createdBy: {
                        id: group.createdBy._id,
                        name: group.createdBy.profile?.fullName || group.createdBy.username
                    },
                    createdAt: group.createdAt,
                    tags: group.tags
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalGroups,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res) => {
    try {
        const { name, description, tags } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Name and description are required'
            });
        }

        // Check if group name already exists
        const existingGroup = await Group.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            isActive: true
        });

        if (existingGroup) {
            return res.status(400).json({
                success: false,
                message: 'Group name already exists'
            });
        }

        // Create group with creator as admin member
        const group = await Group.create({
            name: name.trim(),
            description: description.trim(),
            createdBy: req.user.id,
            members: [{
                user: req.user.id,
                role: 'admin'
            }],
            tags: tags || []
        });

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: {
                group: {
                    id: group._id,
                    name: group.name,
                    description: group.description,
                    memberCount: group.memberCount,
                    createdBy: req.user.id,
                    createdAt: group.createdAt,
                    tags: group.tags
                }
            }
        });

    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get group details
// @route   GET /api/groups/:groupId
// @access  Private
export const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findOne({ _id: groupId, isActive: true })
            .populate('createdBy', 'username profile.fullName')
            .populate('members.user', 'username profile.fullName reputation');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is a member
        const isMember = group.members.some(member =>
            member.user._id.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You must be a member of this group to view details'
            });
        }

        // Get recent questions in this group (assuming questions have a group field)
        const questions = await Question.find({ group: groupId, isActive: true })
            .populate('user', 'username profile.fullName')
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title votes answers createdAt');

        res.status(200).json({
            success: true,
            data: {
                group: {
                    id: group._id,
                    name: group.name,
                    description: group.description,
                    members: group.members.map(member => ({
                        id: member.user._id,
                        name: member.user.profile?.fullName || member.user.username,
                        role: member.role,
                        joinedAt: member.joinedAt
                    })),
                    questions: questions,
                    createdAt: group.createdAt,
                    tags: group.tags
                }
            }
        });

    } catch (error) {
        console.error('Get group details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Join a group
// @route   POST /api/groups/:groupId/join
// @access  Private
export const joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findOne({ _id: groupId, isActive: true });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if already a member
        const isMember = group.members.some(member =>
            member.user.toString() === req.user.id
        );

        if (isMember) {
            return res.status(400).json({
                success: false,
                message: 'Already a member of this group'
            });
        }

        // Add user to group
        group.members.push({
            user: req.user.id,
            role: 'member'
        });
        group.memberCount = group.members.length;
        await group.save();

        res.status(200).json({
            success: true,
            message: 'Joined group successfully'
        });

    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Leave a group
// @route   POST /api/groups/:groupId/leave
// @access  Private
export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findOne({ _id: groupId, isActive: true });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Find member
        const memberIndex = group.members.findIndex(member =>
            member.user.toString() === req.user.id
        );

        if (memberIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'Not a member of this group'
            });
        }

        // Don't allow last admin to leave
        const member = group.members[memberIndex];
        if (member.role === 'admin') {
            const adminCount = group.members.filter(m => m.role === 'admin').length;
            if (adminCount === 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot leave group as the last admin'
                });
            }
        }

        // Remove member
        group.members.splice(memberIndex, 1);
        group.memberCount = group.members.length;
        await group.save();

        res.status(200).json({
            success: true,
            message: 'Left group successfully'
        });

    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Post question in group
// @route   POST /api/groups/:groupId/questions
// @access  Private
export const postGroupQuestion = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { title, body, tags } = req.body;

        if (!title || !body) {
            return res.status(400).json({
                success: false,
                message: 'Title and body are required'
            });
        }

        // Verify group exists and user is member
        const group = await Group.findOne({ _id: groupId, isActive: true });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const isMember = group.members.some(member =>
            member.user.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You must be a member of this group to post questions'
            });
        }

        // Create question with group reference
        const question = await Question.create({
            title: title.trim(),
            body: body.trim(),
            user: req.user.id,
            tags: tags || [],
            group: groupId
        });

        res.status(201).json({
            success: true,
            message: 'Question posted in group successfully',
            data: {
                question: {
                    id: question._id,
                    title: question.title,
                    body: question.body,
                    tags: question.tags,
                    createdAt: question.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Post group question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get group questions
// @route   GET /api/groups/:groupId/questions
// @access  Private
export const getGroupQuestions = async (req, res) => {
    try {
        const { groupId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Verify group exists and user is member
        const group = await Group.findOne({ _id: groupId, isActive: true });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const isMember = group.members.some(member =>
            member.user.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You must be a member of this group to view questions'
            });
        }

        const questions = await Question.find({ group: groupId, isActive: true })
            .populate('user', 'username profile.fullName reputation')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title body tags votes answers createdAt');

        const totalQuestions = await Question.countDocuments({ group: groupId, isActive: true });
        const totalPages = Math.ceil(totalQuestions / limit);

        res.status(200).json({
            success: true,
            data: {
                questions: questions.map(q => ({
                    id: q._id,
                    title: q.title,
                    body: q.body,
                    author: {
                        id: q.user._id,
                        name: q.user.profile?.fullName || q.user.username,
                        reputation: q.user.reputation
                    },
                    tags: q.tags,
                    votes: q.votes,
                    answers: q.answers,
                    createdAt: q.createdAt
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalQuestions,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get group questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};