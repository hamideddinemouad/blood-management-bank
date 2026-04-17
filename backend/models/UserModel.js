import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { moroccanPhoneValidator, normalizeMoroccanPhone } from "../utils/moroccanPhone.js";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ["donor", "hospital", "admin"],
    required: true
  },
  phone: {
    type: String,
    set: normalizeMoroccanPhone,
    validate: {
      validator(value) {
        if (!value && this.role === "admin") {
          return true;
        }
        return moroccanPhoneValidator.validator(value);
      },
      message: moroccanPhoneValidator.message
    },
    required: function () {
      return this.role !== "admin";
    }
  },
  address: {
    type: String,
    required: function () {
      return this.role === "hospital";
    }
  },
  bloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    required: function () {
      return this.role === "donor";
    }
  },
  healthInfo: {
    weight: {
      type: Number,
      min: 40,
      max: 200
    },
    height: {
      type: Number,
      min: 140,
      max: 220
    },
    hasDiseases: {
      type: Boolean,
      default: false
    },
    diseaseDetails: {
      type: String
    }
  },
  hospitalInfo: {
    licenseNumber: {
      type: String,
      required: function () {
        return this.role === "hospital";
      },
      unique: true,
      sparse: true
    },
    emergencyContact: {
      type: String,
      set: normalizeMoroccanPhone,
      validate: {
        validator(value) {
          if (!value) {
            return true;
          }
          return moroccanPhoneValidator.validator(value);
        },
        message: moroccanPhoneValidator.message
      }
    }
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password.trim(), 12);
  next();
});
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword.trim(), this.password);
};
export default mongoose.model("User", userSchema);
