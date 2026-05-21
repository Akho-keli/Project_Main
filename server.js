const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const app = express();
//This is my Middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// This is my DATABASE connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Akhokelimnkabane2004@",
  database: "Login"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// EMAIL 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "keliakho49@gmail.com",
    pass: "jhlcovzdfgqnfkii" //My app password
  }
});

// This part is for REGISTER
app.post("/register", async (req, res) => {
  const { username, email, password, Phone_Number } = req.body;

  if (!username || !email || !password || !Phone_Number) {
    return res.status(400).send("All fields are required");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO Users (user_name, user_email, user_password, Phone_Number)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [username, email, hashedPassword, Phone_Number], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).send("Email already registered");
        }
        return res.status(500).send("Error saving user");
      }

      res.send("User registered successfully");
    });

  } catch (err) {
    res.status(500).send("Server error");
  }
});

// This part is for LOGIN 
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password required");
  }

  db.query("SELECT * FROM Users WHERE user_email = ?", [email], async (err, results) => {
    if (err) return res.status(500).send("DB error");

    if (results.length === 0) {
      return res.status(400).send("Invalid credentials");
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.user_password);

    if (!match) {
      return res.status(400).send("Invalid credentials");
    }

    res.json({
      message: "Login Successful",
      user: {
        username: user.user_name,
        email: user.user_email,
        phone: user.Phone_Number
      }
    });
  });
});

//To Update the profile
app.put("/updateProfile", (req, res) => {
  const { oldEmail, newUsername, newEmail, Phone_Number } = req.body;

  if (!oldEmail || !newUsername || !newEmail) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const sql = `
    UPDATE Users 
    SET user_name=?, user_email=?, Phone_Number=? 
    WHERE user_email=?
  `;

  db.query(sql, [newUsername, newEmail, Phone_Number || "", oldEmail], (err, result) => {
    if (err) {
      console.log(err); //IMPORTANT: shows real error in terminal
      return res.status(500).json({ message: "Update failed" });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        username: newUsername,
        email: newEmail,
        phone: Phone_Number
      }
    });
  });
});

// This part is for deleting the profile
app.delete("/deleteProfile", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send("Email required");
  }

  db.query("DELETE FROM Users WHERE user_email=?", [email], (err) => {
    if (err) return res.status(500).send("Error deleting account");

    res.send("Account deleted successfully");
  });
});

//  SEND OTP 
app.post("/send-otp", (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send("Email required");

  db.query("SELECT * FROM Users WHERE user_email=?", [email], (err, results) => {
    if (err) return res.status(500).send("DB error");

    if (results.length === 0) {
      return res.status(400).send("Email not registered");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60000);

    db.query(
      "INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiry],
      (err) => {
        if (err) return res.status(500).send("DB Error");

        transporter.sendMail({
          from: "keliakho@gmail.com",
          to: email,
          subject: "Password Reset OTP",
          text: `Your OTP is: ${otp} it will expire in 5 minutes`
        });

        res.send("OTP sent successfully");
      }
    );
  });
});

//This part is for VERIFYING The OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).send("Email and OTP required");
  }

  const sql = `
    SELECT * FROM password_resets
    WHERE email = ? AND otp = ?
    ORDER BY id DESC LIMIT 1
  `;

  db.query(sql, [email, otp], (err, results) => {
    if (err) return res.status(500).send("DB error");

    if (results.length === 0) {
      return res.status(400).send("Invalid OTP");
    }

    const record = results[0];
    const now = new Date();

    if (now > record.expires_at) {
      return res.status(400).send("OTP expired");
    }

    res.send("OTP verified successfully");
  });
});

// The part if for the resting the password
app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).send("Email and password required");
  }

  if (newPassword.length < 6) {
    return res.status(400).send("Password too short");
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query(
      "UPDATE Users SET user_password=? WHERE user_email=?",
      [hashedPassword, email],
      (err) => {
        if (err) return res.status(500).send("Error updating password");

        res.send("Password reset successfully");
      }
    );

  } catch (err) {
    res.status(500).send("Server error");
  }
});
/*app.post("/ai", async (req, res) => {
  try {
    const { message, systemData } = req.body;

    if (!message || !systemData) {
      return res.status(400).json({ reply: "Missing data" });
    }

    const msg = message.toLowerCase();

    const apt = systemData.apartment || { gas: 0, temp: 0 };
    const cylinders = systemData.cylinders || [];
    const gasHistory = systemData?.gasHistory || [apt.gas];

    const emergencyContacts = {
      fire: "10111",
      ambulance: "10177",
      police: "10111",
      gasCompany: "0800-GAS-HELP"
    };

    // ================= INTENT DETECTION =================
    function getIntent(message) {
      const m = message.toLowerCase();

      // EMERGENCY (HIGHEST PRIORITY)
      if (
        m.includes("gas leak") ||
        m.includes("smell gas") ||
        m.includes("explosion") ||
        m.includes("hissing") ||
        //m.includes("emergency") ||
        m.includes("leak")
      ) return "EMERGENCY";

      // CONTACT
      if (
        m.includes("emergency contact") ||
        m.includes("who do i call") ||
        m.includes("contact number") ||
        m.includes("emergency numbers") ||
        m.includes("emergency contacts")
      ) return "CONTACT";

      // SAFETY CHECK
      if (
        m.includes("is my system safe") ||
        m.includes("am i safe") ||
        m.includes("risk") ||
        m.includes("danger")
      ) return "SAFETY_CHECK";

      // ACTION
      if (
        m.includes("what should i do") ||
        m.includes("how do i") ||
        m.includes("steps") ||
        m.includes("what to do") ||
        m.includes("help")
      ) return "ACTION";

      // INFO
      if (
        m.includes("gas level") ||
        m.includes("temperature") ||
        m.includes("status") ||
        m.includes("risk score")
      ) return "INFO";

      // GREETING
      if (
        m.includes("hi") ||
        m.includes("hello") ||
        m.includes("hey")
      ) return "GREETING";

      return "GENERAL";
    }

    const intent = getIntent(message);

    // ================= RISK CALCULATION =================
    let risk = 0;
    let issues = [];

    if (apt.gas < 20) {
      risk += 40;
      issues.push("Low apartment gas level");
    }

    if (apt.temp > 35) {
      risk += 40;
      issues.push("High apartment temperature");
    }

    cylinders.forEach(c => {
      if (c.gas < 20) {
        risk += 10;
        issues.push(`${c.name} has low gas`);
      }
      if (c.temp > 35) {
        risk += 10;
        issues.push(`${c.name} is overheating`);
      }
      if (c.pressure > 50) {
        risk += 10;
        issues.push(`${c.name} has high pressure`);
      }
    });

    if (risk > 100) risk = 100;

    // ================= PREDICTION =================
    function calculateRate(history) {
      if (history.length < 2) return 0;

      let drop = 0;
      for (let i = 1; i < history.length; i++) {
        drop += (history[i - 1] - history[i]);
      }

      return drop / history.length;
    }

    const rate = calculateRate(gasHistory);
    const safeRate = Math.max(rate, 0.01);
    const timeLeft = apt.gas > 0 ? (apt.gas / safeRate) * 3 / 60 : null;

    // ================= GREETING =================
    if (intent === "GREETING") {
      return res.json({
        reply: `
Welcome to the Gas Safety Monitoring System.

I am your AI Safety Assistant.

You can ask:
• Is my system safe?
• What should I do in an emergency?
• Check gas or temperature risk
                `
      });
    }

    // ================= EMERGENCY =================
    if (intent === "EMERGENCY") {
      return res.json({
        reply: `
EMERGENCY DETECTED 

Immediate Actions:
• Turn off gas supply immediately
• Do NOT use electrical switches
• Open all windows
• Evacuate the area if gas smell is strong
• Call emergency services if needed
                `
      });
    }

    // ================= CONTACT =================
    if (intent === "CONTACT") {
      return res.json({
        reply: `
Emergency Contacts:

Fire: ${emergencyContacts.fire}
Ambulance: ${emergencyContacts.ambulance}
Police: ${emergencyContacts.police}
Gas Emergency: ${emergencyContacts.gasCompany}
                `
      });
    }

    // ================= SAFETY CHECK =================
    if (intent === "SAFETY_CHECK") {
      if (timeLeft && timeLeft < 10) {
        issues.push("Gas may run out soon");
      }

      if (risk < 40) {
        return res.json({
          reply: `
SYSTEM STATUS: SAFE

All readings are within safe limits.

Recommendation:
• Continue monitoring regularly
                    `
        });
      }

      return res.json({
        reply: `
SYSTEM STATUS: NOT SAFE

Issues detected:
${issues.map(i => `• ${i}`).join("\n")}

Recommendation:
• Take preventive action immediately
                `
      });
    }

    // ================= ACTION =================
    if (intent === "ACTION") {
      return res.json({
        reply: `
Recommended Actions:

• Turn off gas supply
• Ventilate the area
• Avoid ignition sources
• Monitor system continuously
• Contact emergency services if needed
                `
      });
    }

    // ================= INFO =================
    if (intent === "INFO") {
      return res.json({
        reply: `
SYSTEM STATUS

Gas Level: ${apt.gas}%
Temperature: ${apt.temp}°C
Risk Score: ${risk}/100

Prediction:
Rate: ${rate.toFixed(2)}% per cycle
Time Left: ${timeLeft ? timeLeft.toFixed(1) + " mins" : "Stable"}

Status: ${risk < 40 ? "Safe" : risk < 70 ? "Warning" : "Critical"}
                `
      });
    }

    // ================= GROQ FALLBACK =================
    const prompt = `
You are a professional Gas Safety AI assistant.

User question:
${message}

System:
Gas: ${apt.gas}%
Temperature: ${apt.temp}°C
Risk Score: ${risk}/100

Rules:
- Be concise
- Focus on safety advice only
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are a strict gas safety assistant."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Unable to generate response.";

    return res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: "Server error: " + err.message
    });
  }
});*/
// This part is for starting the server

// CLIENTS 

app.post("/clients", (req, res) => {

  const { name, email, plan, monthly } = req.body;

  const sql = `
    INSERT INTO insurance_clients
    (client_name, client_email, insurance_plan, monthly_fee, last_paid)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [name, email, plan, monthly], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).send("DB error");
    }

    res.json({ message: "Client saved" });
  });
});

// GET ALL CLIENTS

app.get("/clients", (req, res) => {

  const sql = `
    SELECT * FROM insurance_clients
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.log(err);
      return res.status(500).send("Database error");
    }

    res.json(results);
  });
});


// SAVE ITEMS


app.post("/items", (req, res) => {

  const {
    clientName,
    category,
    itemName,
    amount
  } = req.body;

  // VALIDATION
  if (
    !clientName ||
    !category ||
    !itemName ||
    !amount
  ) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const sql = `
    INSERT INTO insured_items
    (
      client_name,
      category,
      item_name,
      amount
    )
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      clientName,
      category,
      itemName,
      amount
    ],
    (err, result) => {

      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Database error"
        });
      }

      res.json({
        message: "Item stored successfully"
      });
    }
  );
});


// GET ITEMS

app.get("/items", (req, res) => {

  const sql = `
    SELECT * FROM insured_items
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.log(err);
      return res.status(500).send("Database error");
    }

    res.json(results);
  });
});

// CLAIM SYSTEM

app.post("/claims", (req, res) => {

  const {
    clientName,
    clientEmail,   
    room,
    damageLevel,
    claimAmount,
    insurancePlan
  } = req.body;

  if (
    !clientName ||
    !clientEmail ||   
    !room ||
    !damageLevel ||
    !claimAmount ||
    !insurancePlan
  ) {
    return res.status(400).send("Missing claim fields");
  }

  const sql = `
    INSERT INTO insurance_claims
    (
      client_name,
      client_email,   
      room_number,
      damage_level,
      claim_amount,
      insurance_plan,
      claim_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      clientName,
      clientEmail,   // ✅ ADD THIS
      room,
      damageLevel,
      claimAmount,
      insurancePlan,
      "Pending"
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).send("Claim error");
      }

      res.json({
        message: "Claim submitted successfully"
      });
    }
  );
});

// GET CLAIMS

app.get("/claims", (req, res) => {

  const sql = `
    SELECT * FROM insurance_claims
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.log(err);
      return res.status(500).send("Database error");
    }

    res.json(results);
  });
});


// OVERDUE USERS

app.get("/overdue", (req, res) => {

  const sql = `
    SELECT *
    FROM insurance_clients
    WHERE DATEDIFF(NOW(), last_paid) > 30
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.log(err);
      return res.status(500).send("Database error");
    }

    res.json(results);
  });
});

// UPDATE PAYMENT DATE

app.put("/payInsurance", (req, res) => {

  const { email } = req.body;

  if (!email) {
    return res.status(400).send("Email required");
  }

  const sql = `
    UPDATE insurance_clients
    SET last_paid = NOW()
    WHERE client_name = ?
  `;

  db.query(sql, [email], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).send("Payment update failed");
    }

    res.json({
      message: "Payment updated successfully"
    });
  });
});
app.get("/claims", (req, res) => {

  const sql = `
    SELECT * FROM insurance_claims
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.log(err);
      return res.status(500).send("Database error");
    }

    res.json(results);
  });
});
//
// 
app.post("/clients", (req, res) => {

  const { name, email, plan, monthly } = req.body;

  const sql = `
    INSERT INTO insurance_clients
    (client_name, client_email, insurance_plan, monthly_fee, last_paid)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [name, email, plan, monthly], (err) => {

    if (err) {
      console.log(err);
      return res.status(500).send("DB error");
    }

    res.json({ message: "Client saved" });
  });
});


// GET CLIENTS

app.get("/clients", (req, res) => {

  db.query(
    "SELECT * FROM insurance_clients ORDER BY id DESC",
    (err, results) => {

      if (err) return res.status(500).send("DB error");

      res.json(results);
    }
  );
});


// CLAIMS CREATE 
app.post("/claims", (req, res) => {

  const {
    clientName,
    clientEmail,
    room,
    damageLevel,
    claimAmount,
    insurancePlan
  } = req.body;

  const sql = `
    INSERT INTO insurance_claims
    (client_name, client_email, room_number, damage_level, claim_amount, insurance_plan, claim_status)
    VALUES (?, ?, ?, ?, ?, ?, 'Pending')
  `;

  db.query(
    sql,
    [clientName, clientEmail, room, damageLevel, claimAmount, insurancePlan],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).send("Claim error");
      }

      res.json({ message: "Claim saved successfully" });
    }
  );
});

app.get("/claims", (req, res) => {

  db.query(
    "SELECT * FROM insurance_claims ORDER BY id DESC",
    (err, results) => {

      if (err) return res.status(500).send("DB error");

      res.json(results);
    }
  );
});


// ===============================
// UPDATE CLAIM STATUS + EMAIL (FIXED)
// ===============================
app.put("/claims/status", (req, res) => {

  const { id, status } = req.body;

  const allowed = ["Pending", "Approved", "Rejected"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // STEP 1: GET CLAIM
  db.query(
    "SELECT * FROM insurance_claims WHERE id=?",
    [id],
    (err, results) => {

      if (err) {
        return res.status(500).send("DB error");
      }

      if (results.length === 0) {
        return res.status(404).send("Claim not found");
      }

      const claim = results[0];

      // SAFE EMAIL CHECK
      if (!claim.client_email || claim.client_email.trim() === "") {
        return res.status(400).send("Missing client email in DB");
      }

      // STEP 2: UPDATE STATUS
      db.query(
        "UPDATE insurance_claims SET claim_status=? WHERE id=?",
        [status, id],
        (err2) => {

          if (err2) {
            return res.status(500).send("DB error");
          }

          // STEP 3: SEND EMAIL
          transporter.sendMail(
            {
              from: "ApartmentShield <keliakho49@gmail.com>", // FIXED GMAIL TYPO
              to: claim.client_email,
              subject: `Claim ${status}`,
              text: `
Hello ${claim.client_name},

Your claim has been: ${status}

Room: ${claim.room_number}
Damage Level: ${claim.damage_level}
Amount: R ${claim.claim_amount}

Thank you,
ApartmentShield
              `
            },
            (err3) => {
              if (err3) {
                console.log("Email error:", err3);
              }
            }
          );

          res.json({
            message: `Claim ${status} + email sent`
          });
        }
      );
    }
  );
});
app.delete("/claims/:id", (req, res) => {

  const { id } = req.params;

  const sql = "DELETE FROM insurance_claims WHERE id = ?";

  db.query(sql, [id], (err) => {

    if (err) {
      console.log(err);
      return res.status(500).send("Delete error");
    }

    res.json({ message: "Claim deleted successfully" });
  });
});

//Clendar part
app.post("/add-task", (req, res) => {

  const {
    month,
    day,
    year,
    email,
    text
  } = req.body;

  /* VALIDATION */

  if (
    !month &&
    month !== 0
  ) {

    return res.json({
      success: false,
      message: "Month Required"
    });
  }

  if (!day || !year || !email || !text) {

    return res.json({
      success: false,
      message: "Fill All Fields"
    });
  }

  /* EMAIL VALIDATION */

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {

    return res.json({
      success: false,
      message: "Invalid Email"
    });
  }

  const sql = `
        INSERT INTO tasks
        (month,day,year,email,text,notified)
        VALUES (?,?,?,?,?,?)
    `;

  db.query(
    sql,
    [
      month,
      day,
      year,
      email,
      text,
      0
    ],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.json({
          success: false
        });
      }

      res.json({
        success: true
      });
    }
  );
});

/* GET TASKS */

app.get("/tasks", (req, res) => {

  const sql = `
        SELECT * FROM tasks
        ORDER BY year,month,day
    `;

  db.query(sql, (err, result) => {

    if (err) {

      console.log(err);

      return res.json([]);
    }

    res.json(result);
  });
});

/* DELETE TASK */

app.delete("/delete-task/:id", (req, res) => {

  const id = req.params.id;

  db.query(
    "DELETE FROM tasks WHERE id=?",
    [id],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.json({
          success: false
        });
      }

      res.json({
        success: true
      });
    }
  );
});

/* CHECK TASKS + SEND EMAIL */

app.get("/check-tasks", (req, res) => {

  const today = new Date();

  const day = today.getDate();

  const month = today.getMonth();

  const year = today.getFullYear();

  const sql = `
        SELECT *
        FROM tasks
        WHERE
        day = ?
        AND month = ?
        AND year = ?
        AND notified = 0
    `;

  db.query(
    sql,
    [day, month, year],
    async (err, result) => {

      if (err) {

        console.log(err);

        return res.json([]);
      }

      /* SEND EMAILS */

      for (const task of result) {

        try {

          await transporter.sendMail({

            from: "keliakho49@gmail.com",

            to: task.email,

            subject: `📅Reminder: ${task.text}`,

            html: `

                            <h2>Task Reminder</h2>

                            <p>
                                Your scheduled task:
                            </p>

                            <h3>
                                ${task.text}
                            </h3>

                            <p>
                                is due today.
                            </p>
                        `
          });

          /* MARK AS NOTIFIED */

          db.query(
            `
                        UPDATE tasks
                        SET notified = 1
                        WHERE id = ?
                        `,
            [task.id]
          );

        } catch (error) {

          console.log(error);
        }
      }

      res.json(result);
    }
  );
});

/* ROOT */

app.get("/", (req, res) => {

  res.send("Calendar Backend Running");
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});