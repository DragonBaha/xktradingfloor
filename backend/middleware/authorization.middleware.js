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
      // Check if user has special permission (e.g., Admin role bypasses permission checks)
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
      // Ensure permission is an array
      const requiredPermissions = Array.isArray(permission) ? permission : [permission];

      // Check permissions for each module
      for (const moduleName of moduleNames) {
        let modulePath = moduleName;
        if (!moduleName.includes(".")) {
          modulePath = `commonPermissions.${moduleName}`;
        }

        const parts = modulePath.split(".");
        let assignedPermissions = permissions.toObject();

        // Navigate through the nested structure
        for (const part of parts) {
          if (assignedPermissions && assignedPermissions[part]) {
            assignedPermissions = assignedPermissions[part];
          } else {
            assignedPermissions = null;
            break;
          }
        }

        if (!assignedPermissions) {
          continue; // Try next module
        }

        // Verify if all required permissions are present
        const allowed = requiredPermissions.every((p) => {
          const permValue = assignedPermissions[p];
          return permValue === true || (typeof permValue === 'object' && permValue?.value === true);
        });

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
