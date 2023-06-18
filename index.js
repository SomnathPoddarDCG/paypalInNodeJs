const express = require("express");
const Booking = require("./bookingModel");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const paypal = require("paypal-rest-sdk");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRECT,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

app.get("/", async (req, res, next) => {
  res.json({ status: 1, data: "working" });
});

app.post("/pay", async (req, res) => {
  try {
    const bookedFor = req.body.bookedFor;
    const price = req.body.price.trim();
    const itemName = req.body.item.trim();
    const name = req.body.name.trim();
    const bookingDate = req.body.date.trim();
    const phone = req.body.phone.trim();
    const email = req.body.email.trim();
    const address = req.body.address.trim();
    const numOfGuests = req.body.numOfGuests.trim();
    const hours = req.body.hours.trim();
    console.log(req.body.bookedFor);
    if (!bookedFor || !price || !itemName)
      return res.json({
        status: 0,
        msg: "bookedFor, price, itemName fields are required",
      });
    // const bookedFor = "testing";
    // const price = "100";
    // const itemName = "Testing";
    // return res.json({ bookedFor, price, itemName });
    const currentDate = new Date().toJSON().slice(0, 10);
    let date = "";
    let sku = date.concat(
      "WS-",
      currentDate.slice(8, 10),
      currentDate.slice(5, 7),
      currentDate.slice(2, 4),
      getRandomInt(9999)
    );

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: process.env.RETURN_URL,
        cancel_url: process.env.CENCEL_URL,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: itemName,
                sku: sku,
                price: price,
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: price,
          },
          description: bookedFor,
        },
      ],
    };
    app.get("/success", async (req, res) => {
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;
      console.log(
        bookedFor,
        price,
        itemName,
        name,
        bookingDate,
        phone,
        email,
        address,
        numOfGuests,
        hours
      );
      const execute_payment_json = {
        payer_id: payerId,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: price,
            },
          },
        ],
      };
      //   date=2023-06-12&name=s&phone=8617063982&email=s%40gmail.com&address=malda&numOfGuests=3&hours=2&space=Corporate+Meetings+or+annual+gatherings&spaceId=1
      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        async function (error, payment) {
          if (error) {
            console.log(error.response);
            throw error;
          } else {
            let fullUrl = req.originalUrl;
            console.log(fullUrl);
            console.log(JSON.stringify(payment));

            const insertBooking = await Booking.create({
              date: bookingDate,
              name,
              phone,
              email,
              address,
              numOfGuests,
              hours,
              price,
              bookingFor: bookedFor,
              bookingId: sku,
              paymentInfo: {
                paymentId: payment.id,
                PayerID: req.query.PayerID,
                paymentStatus: "VERIFIED",
                token: req.params.token,
                payer: payment.payer,
              },
            });

            res
              .writeHead(301, {
                Location: `http://localhost:3000/${req.originalUrl}`,
              })
              .end();

            // return res.json({ status: 1, data: payment });
          }
        }
      );
    });
    app.get("/data", (req, res) => {
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;

      const execute_payment_json = {
        payer_id: payerId,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: price,
            },
          },
        ],
      };
      //   date=2023-06-12&name=s&phone=8617063982&email=s%40gmail.com&address=malda&numOfGuests=3&hours=2&space=Corporate+Meetings+or+annual+gatherings&spaceId=1
      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        function (error, payment) {
          if (error) {
            console.log(error.response);
            throw error;
          } else {
            console.log(JSON.stringify(payment));
            return res.json({ status: 1, data: payment });
          }
        }
      );
    });

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
  } catch (err) {
    console.log(err);
    return res.json({ status: 0, msg: "Something Error", err });
  }
});

app.get("/cancel", async (req, res) => {
  res
    .writeHead(301, {
      Location: `http://localhost:3000/${req.originalUrl}`,
    })
    .end();
  return res.json({ status: 0, data: "Failed" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server Started on ${process.env.PORT}`);
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"))
  .catch((err) => {
    console.log(err);
  });
