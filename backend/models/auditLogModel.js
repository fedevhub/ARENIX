const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    aksi: {
      type: String,
      required: true,
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    waktu: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "audit_log",
    versionKey: false,
  },
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
