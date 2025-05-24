const { body, param, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  };
};

// User validation rules
const userValidation = {
  create: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'),
    body('name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters long'),
    body('role')
      .isIn(['user', 'manager', 'superadmin'])
      .withMessage('Invalid role')
  ],
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters long'),
    body('role')
      .optional()
      .isIn(['user', 'manager', 'superadmin'])
      .withMessage('Invalid role'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ]
};

// Product validation rules
const productValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Product name must be at least 2 characters long'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters long'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('stock')
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required')
  ],
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Product name must be at least 2 characters long'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters long'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('stock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
    body('category')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category cannot be empty')
  ]
};

// Customer validation rules
const customerValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Customer name must be at least 2 characters long'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('phone')
      .optional()
      .matches(/^\+?[\d\s-]{10,}$/)
      .withMessage('Please enter a valid phone number'),
    body('address')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Address must be at least 10 characters long')
  ],
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid customer ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Customer name must be at least 2 characters long'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('phone')
      .optional()
      .matches(/^\+?[\d\s-]{10,}$/)
      .withMessage('Please enter a valid phone number'),
    body('address')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Address must be at least 10 characters long')
  ]
};

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = {
  validate,
  userValidation,
  productValidation,
  customerValidation,
  loginValidation
}; 