/**
 * Validation Middleware for Slide Search API
 * Validates query parameters for search, filter, and pagination
 */

/**
 * Validate search query parameters
 */
export const validateSearchParams = (req, res, next) => {
  const { keyword, subject, difficulty, year, sortBy, page, limit, tags } = req.query;

  // Validate keyword
  if (keyword !== undefined) {
    if (typeof keyword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Keyword must be a string'
      });
    }
    if (keyword.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Keyword is too long (max 200 characters)'
      });
    }
  }

  // Validate subject
  if (subject !== undefined && typeof subject !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Subject must be a string'
    });
  }

  // Validate difficulty
  const validDifficulties = ['初級', '中級', '上級', 'N1', 'N2', 'N3', 'N4', 'N5'];
  if (difficulty !== undefined) {
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Difficulty must be one of: ${validDifficulties.join(', ')}`
      });
    }
  }

  // Validate year
  if (year !== undefined) {
    if (typeof year !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Year must be a string'
      });
    }
    // Validate year format (e.g., "2024年")
    if (year !== '全て' && !year.match(/^\d{4}年$/)) {
      return res.status(400).json({
        success: false,
        message: 'Year must be in format "YYYY年" or "全て"'
      });
    }
  }

  // Validate sortBy
  const validSortOptions = ['newest', 'oldest', 'most_viewed', 'difficulty_asc', 'difficulty_desc'];
  if (sortBy !== undefined) {
    if (!validSortOptions.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: `Sort option must be one of: ${validSortOptions.join(', ')}`
      });
    }
  }

  // Validate pagination
  if (page !== undefined) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer'
      });
    }
    req.query.page = pageNum;
  } else {
    req.query.page = 1;
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }
    req.query.limit = limitNum;
  } else {
    req.query.limit = 12;
  }

  // Validate tags (if provided as comma-separated string)
  if (tags !== undefined) {
    if (typeof tags !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Tags must be a comma-separated string'
      });
    }
    // Convert comma-separated string to array
    req.query.tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  next();
};

/**
 * Validate slide ID parameter
 */
export const validateSlideId = (req, res, next) => {
  const { id } = req.params;
  const slideId = parseInt(id, 10);

  if (isNaN(slideId) || slideId < 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid slide ID'
    });
  }

  req.params.id = slideId;
  next();
};
