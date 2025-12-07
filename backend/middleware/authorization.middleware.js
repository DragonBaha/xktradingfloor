const ModuleAcessModel = require("../models/permissions.model");

const { sendErrorResponse } = require("../utils/response");

exports.authorization = (roles) => {
  return async (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        return sendErrorResponse(
          res,
          "You are not authorized to perform this operation",
          403,
          true,
          true
        );
      }
      next();
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  };
};

exports.permissionAuthorization = (
  moduleNames,
  permission,
  specialpermission = []
) => {
  return async (req, res, next) => {
    try {
      // Check if user has special permission
      if (
        specialpermission.length > 0 &&
        specialpermission.includes(req.user.role)
      ) {
        return next(); // Early return to avoid further checks
      }

      // Fetch user permissions
      const permissions = await ModuleAcessModel.findOne({
        userId: req.user._id,
      });
      if (!permissions) {
        return sendErrorResponse(
          res,
          "No permissions found for user",
          403,
          true,
          true
        );
      }

      // Ensure moduleNames is an array
      moduleNames = Array.isArray(moduleNames) ? moduleNames : [moduleNames];

      // Check permissions for each module
      for (const moduleName of moduleNames) {
        const [module, per] = moduleName.split(".");

        if (!module || !per) {
          return sendErrorResponse(
            res,
            "Invalid module or permission format",
            403,
            true,
            true
          );
        }

        // Check if the module and permission exist in the permissions object
        const assignedPermissions = permissions[module.trim()]?.[per.trim()];
        if (!assignedPermissions) {
          return sendErrorResponse(
            res,
            "You are not authorized to perform this operation",
            403,
            true,
            true
          );
        }

        // Verify if all required permissions are present
        const allowed = permission.every((p) => assignedPermissions[p]);

        if (allowed) {
          return next(); // Exit middleware if allowed
        }
      }

      // If no module grants permission, send error
      return sendErrorResponse(
        res,
        "You are not authorized to perform this operation",
        403,
        true,
        true
      );
    } catch (error) {
      console.error(error);
      return sendErrorResponse(res, "Internal server error", 500);
    }
  };
};
