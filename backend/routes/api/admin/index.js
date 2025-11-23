const express = require('express');
const router = express.Router();
const blogRoutes = require('./blog.routes.js');

// Controllers
// const reviewController = require('../../../controllers/review.controller');
// const productController = require('../../../controllers/product.controller');
// const eventController = require('../../../controllers/event.controller');
// const podcastController = require('../../../controllers/podcast.controller');
// const courseController = require('../../../controllers/course.controller');
// const companyController = require('../../../controllers/company.controller');
// const dashboardController = require('../../../controllers/dashboard.controller');

// Dashboard Routes
// router.get('/dashboard/stats', dashboardController.getDashboardStats);
// router.get('/dashboard/pending-approvals', dashboardController.getPendingApprovals);

// Blog Routes
router.use('/blogs', blogRoutes);

// Review Routes
// router.get('/reviews', reviewController.getAllReviews);
// router.get('/reviews/:id', reviewController.getReviewById);
// router.put('/reviews/:id', reviewController.updateReview);
// router.put('/reviews/:id/status', reviewController.updateReviewStatus);
// router.post('/reviews/:id/response', reviewController.addReviewResponse);
// router.delete('/reviews/:id', reviewController.deleteReview);

// Product Routes
// router.post('/products', productController.createProduct);
// router.get('/products', productController.getAllProducts);
// router.get('/products/:id', productController.getProductById);
// router.put('/products/:id', productController.updateProduct);
// router.put('/products/:id/stock', productController.updateStock);
// router.delete('/products/:id', productController.deleteProduct);

// Event Routes
// router.post('/events', eventController.createEvent);
// router.get('/events', eventController.getAllEvents);
// router.get('/events/:id', eventController.getEventById);
// router.put('/events/:id', eventController.updateEvent);
// router.delete('/events/:id', eventController.deleteEvent);

// Podcast Routes
// router.post('/podcasts', podcastController.createPodcast);
// router.get('/podcasts', podcastController.getAllPodcasts);
// router.get('/podcasts/:id', podcastController.getPodcastById);
// router.put('/podcasts/:id', podcastController.updatePodcast);
// router.delete('/podcasts/:id', podcastController.deletePodcast);

// Course Routes
// router.post('/courses', courseController.createCourse);
// router.get('/courses', courseController.getAllCourses);
// router.get('/courses/:id', courseController.getCourseById);
// router.put('/courses/:id', courseController.updateCourse);
// router.delete('/courses/:id', courseController.deleteCourse);

// Company Routes
// router.post('/companies', companyController.createCompany);
// router.get('/companies', companyController.getAllCompanies);
// router.get('/companies/:id', companyController.getCompanyById);
// router.put('/companies/:id', companyController.updateCompany);
// router.put('/companies/:id/status', companyController.updateCompanyStatus);
// router.delete('/companies/:id', companyController.deleteCompany);

module.exports = router;