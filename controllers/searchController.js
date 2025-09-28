import Question from '../models/Question.js';

// @desc    Advanced search for questions
// @route   GET /api/search
// @access  Private
export const advancedSearch = async (req, res) => {
    try {
        const {
            q: query = '',
            tags = '',
            sort = 'relevance',
            unanswered = 'false',
            page = 1,
            limit = 20
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build search query
        let searchQuery = { isActive: true };

        // Text search
        if (query.trim()) {
            searchQuery.$text = { $search: query.trim() };
        }

        // Tag filtering
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            if (tagArray.length > 0) {
                searchQuery.tags = { $in: tagArray };
            }
        }

        // Unanswered filter
        if (unanswered === 'true') {
            searchQuery.answers = { $size: 0 };
        }

        // Build sort options
        let sortOptions = {};
        switch (sort) {
            case 'relevance':
                if (query.trim()) {
                    sortOptions = { score: { $meta: 'textScore' } };
                } else {
                    sortOptions = { votes: -1, createdAt: -1 };
                }
                break;
            case 'newest':
                sortOptions = { createdAt: -1 };
                break;
            case 'votes':
                sortOptions = { votes: -1, createdAt: -1 };
                break;
            default:
                sortOptions = { createdAt: -1 };
        }

        // Use aggregation for better performance - combine search and count
        const searchPipeline = [
            { $match: searchQuery },
            {
                $facet: {
                    questions: [
                        ...(query.trim() && sort === 'relevance' ? [{ $addFields: { score: { $meta: 'textScore' } } }] : []),
                        { $sort: sortOptions },
                        { $skip: skip },
                        { $limit: limitNum },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user',
                                pipeline: [
                                    { $project: { username: 1, 'profile.fullName': 1, reputation: 1 } }
                                ]
                            }
                        },
                        { $unwind: '$user' },
                        { $project: { title: 1, body: 1, tags: 1, votes: 1, answers: 1, createdAt: 1, user: 1 } }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ];

        const searchResult = await Question.aggregate(searchPipeline);
        const questions = searchResult[0].questions;
        const totalQuestions = searchResult[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalQuestions / limitNum);

        // Get related questions more efficiently (avoid $nin with large arrays)
        let relatedQuestions = [];
        if (tags && questions.length > 0) {
            // Only get related questions if we have tags and results
            const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            if (tagArray.length > 0) {
                relatedQuestions = await Question.find({
                    isActive: true,
                    tags: { $in: tagArray }
                })
                    .populate('user', 'username profile.fullName')
                    .sort({ votes: -1, createdAt: -1 })
                    .limit(8) // Get more to filter out current results
                    .select('title tags votes answers createdAt');

                // Filter out questions that are already in results
                const resultIds = new Set(questions.map(q => q._id.toString()));
                relatedQuestions = relatedQuestions.filter(q => !resultIds.has(q._id.toString())).slice(0, 5);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                query: query.trim(),
                results: questions.map(question => ({
                    id: question._id,
                    title: question.title,
                    body: question.body,
                    author: {
                        id: question.user._id,
                        name: question.user.profile?.fullName || question.user.username,
                        reputation: question.user.reputation
                    },
                    tags: question.tags,
                    votes: question.votes,
                    answers: question.answers.length,
                    relevanceScore: question.score || 0,
                    createdAt: question.createdAt
                })),
                relatedQuestions: relatedQuestions.map(question => ({
                    id: question._id,
                    title: question.title,
                    tags: question.tags,
                    votes: question.votes,
                    answers: question.answers.length,
                    createdAt: question.createdAt
                })),
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalQuestions,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                },
                filters: {
                    tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
                    sort,
                    unanswered: unanswered === 'true'
                }
            }
        });

    } catch (error) {
        console.error('Advanced search error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get search suggestions and popular tags
// @route   GET /api/search/suggestions
// @access  Private
export const getSearchSuggestions = async (req, res) => {
    try {
        const { q: partialQuery = '' } = req.query;

        let suggestions = [];
        let popularTags = [];

        // Get popular tags (most used tags)
        const tagStats = await Question.aggregate([
            { $match: { isActive: true } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        popularTags = tagStats.map(stat => stat._id);

        // Get question title suggestions based on partial query
        if (partialQuery.trim()) {
            const titleSuggestions = await Question.find({
                isActive: true,
                title: { $regex: partialQuery.trim(), $options: 'i' }
            })
                .select('title')
                .sort({ votes: -1 })
                .limit(5);

            suggestions = titleSuggestions.map(q => q.title);
        }

        res.status(200).json({
            success: true,
            data: {
                suggestions,
                popularTags
            }
        });

    } catch (error) {
        console.error('Get search suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get trending topics/tags
// @route   GET /api/search/trending
// @access  Private
export const getTrendingTopics = async (req, res) => {
    try {
        // Get trending tags from questions in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendingTags = await Question.aggregate([
            {
                $match: {
                    isActive: true,
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    questionCount: { $sum: 1 },
                    totalVotes: { $sum: '$votes' },
                    recentQuestions: { $push: '$createdAt' }
                }
            },
            {
                $addFields: {
                    score: {
                        $add: [
                            '$questionCount',
                            { $divide: ['$totalVotes', 10] }
                        ]
                    }
                }
            },
            { $sort: { score: -1 } },
            { $limit: 20 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                trending: trendingTags.map(tag => ({
                    tag: tag._id,
                    questionCount: tag.questionCount,
                    totalVotes: tag.totalVotes,
                    score: Math.round(tag.score * 100) / 100
                }))
            }
        });

    } catch (error) {
        console.error('Get trending topics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};