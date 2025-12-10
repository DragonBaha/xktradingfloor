const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const permissionSchema = {
    create: {
        type: Boolean,
        default: false,
    },
    read: {
        type: Boolean,
        default: false,
    },
    update: {
        type: Boolean,
        default: false,
    },
    delete: {
        type: Boolean,
        default: false,
    },
};

const createPermissionSchema = {
    create: {
        type: Boolean,
    },
};

const readPermissionSchema = {
    read: {
        type: Boolean,
        default: true,
    },
};

const updatePermissionSchema = {
    update: {
        type: Boolean,
    },
};

const deletePermissionSchema = {
    delete: {
        type: Boolean,
    },
};

const ModuleAcessSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        commonPermissions: {
            dashboard: readPermissionSchema,
            company: permissionSchema, // Company permissions with create, read, update, delete
        },
    },
    {
        timestamps: true,
        __v: false,
    }
);

const ModuleAcessModel = mongoose.model(
    "auto_module_access",
    ModuleAcessSchema
);

module.exports = ModuleAcessModel;