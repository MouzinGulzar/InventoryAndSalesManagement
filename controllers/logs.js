const params = require("../utils/params");

const Log = require("../models/Log");

const helpers = require("../utils/helpers");

exports.getLogs = async (req, res) => {
  let query = req.query.q || "";
  let opr = req.query.operation || "";
  let coll = req.query.collection || "";
  let date = req.query.date || "";
  let uid = req.query.uid || "";
  let page = parseInt(req.query.page) || 1;
  let limit = 100;

  let db_filter = {};

  if (query) {
    db_filter.$or = [
      { opr: new RegExp(helpers.escapeRegex(query), "i") },
      { coll: new RegExp(helpers.escapeRegex(query), "i") },
      { "changes.name": new RegExp(helpers.escapeRegex(query), "i") },
    ];
  }
  if (opr) {
    db_filter.opr = opr;
  }
  if (coll) {
    db_filter.coll = coll;
  }
  if (uid) {
    db_filter.uid = uid;
  }
  if (date) {
    db_filter.timestamp = {
      $gte: new Date(`${date}T00:00:00.000Z`),
      $lt: new Date(`${date}T23:59:59.999Z`),
    };
  }

  console.log(db_filter);

  const logs = await Log.find(db_filter)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: "uid",
      model: "admins",
      select: "name",
    });

  const totalLogs = await Log.countDocuments(db_filter);

  console.log(page);
  console.log(logs);

  res.render(
    "logs",
    Object.assign(params("Logs", "/logs"), {
      logs,
      query,
      opr,
      coll,
      date,
      uid,
      page,
      totalLogs,
      user: req.session.user,
    })
  );
};

exports.getLog = async (req, res) => {
  const log = await Log.findById(req.params.id).populate({
    path: "uid",
    model: "admins",
    select: "name",
  });

  console.log(JSON.stringify(log, null, 2));

  res.render(
    "log",
    Object.assign(params("Log", "/log"), {
      log,
      user: req.session.user,
    })
  );
};
