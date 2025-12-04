const express = require('express');
const router = express.Router();
const blogRoutes = require('./blog.routes.js');
const companyRoutes = require('./company.routes.js');
const reviewRoutes = require('./review.routes.js');
const settingRoutes = require('./setting.routes.js');

// Controllers
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

// Company Routes
router.use('/company', companyRoutes);

// Review Routes
router.use('/review', reviewRoutes);

// Settings Routes
router.use('/settings', settingRoutes);

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

module.exports = router;