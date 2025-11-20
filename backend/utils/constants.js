module.exports = {
    database: {
        options: {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // maxPoolSize: 10,
            // bufferCommands: false,
        },
    },
    user: {
        roles: ["Admin", "User", "SubAdmin", "Supervisor"],
    },
    roles: {
        admin: "Admin",
        user: "User",
        subAdmin: "SubAdmin",
        supervisor: "Supervisor",
    },
};
