const mongoose = require("mongoose");

const bookHourSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, "Please provide a valid date"],
  },
  name: {
    type: String,
    required: [true, "Please provide a valid name"],
  },
  phone: {
    type: String,
    required: [true, "Please provide a valid phone"],
  },
  email: {
    type: String,
  },
  address: {
    type: String,
    required: [true, "Please provide a valid address"],
  },
  numOfGuests: {
    type: String,
    required: [true, "Please provide a valid number of Guests"],
  },
  hours: {
    type: String,
    required: [true, "Please provide a valid hours"],
  },
  price: {
    type: String,
    required: [true, "Please provide a valid price"],
  },
  bookingFor: {
    type: String,
    required: [true, "Please provide a valid bookingFor"],
  },
  bookingId: {
    type: String,
    required: [true, "Please provide a valid bookingFor"],
  },

  paymentInfo: {
    paymentId: {
      type: String,
      required: [true, "Please provide a valid tnxId"],
    },
    PayerID: {
      type: String,
      required: [true, "Please provide a valid PayerID"],
    },
    token: {
      type: String,
    },
    paymentStatus: {
      type: String,
      required: [true, "Please provide a valid paymentStatus"],
    },
    payer: {
      type: Object,
    },
  },
});

const Booking = mongoose.model("bookHours", bookHourSchema);
module.exports = Booking;
