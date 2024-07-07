const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { NumberSchema } = require('yup');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB connection
const mongoURI = '<your link>';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define the schema for user registration data
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Define the schema for admin data
const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const Admin = mongoose.model('Admin', adminSchema);


// Add admin user (run this once)
const addAdmin = async () => {
  const adminUsername = 'shivangi.suyash';
  const adminPassword = '1234';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const newAdmin = new Admin({ username: adminUsername, password: hashedPassword });
  await newAdmin.save();
  console.log('Admin user created');
};

// Uncomment to run the admin addition script
// addAdmin();

// API endpoint to handle user registration
app.post('/api/register', async (req, res) => {
  try {
    const {username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// API endpoint to handle user login
app.post('/api/login', async (req, res) => {
  try {
    const { userId,username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// API endpoint to handle admin login
app.post('/api/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Admin login attempt:', username); // Debug log

    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('Admin not found'); // Debug log
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('Password match:', isMatch); // Debug log

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ adminId: admin._id }, 'admin-secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Admin login error:', error); // Debug log
    res.status(500).json({ message: 'Error logging in as admin', error: error.message });
  }
});

// Add this function to create the admin account
async function createAdminAccount() {
  try {
    const adminExists = await Admin.findOne({ username: 'shivangi.suyash' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('1234', 10);
      const admin = new Admin({ username: 'shivangi.suyash', password: hashedPassword });
      await admin.save();
      console.log('Admin account created');
    } else {
      console.log('Admin account already exists');
    }
  } catch (error) {
    console.error('Error creating admin account:', error);
  }
}

// Call this function when your server starts
createAdminAccount();

// Middleware to handle form data and other collections
const formDataSchema = new mongoose.Schema({
  userId: Number,
  name: String,
  subject: String,
  startDate: Date,
  endDate: Date,
  email: [String],
  room: String,
  status: { type: String, default: 'pending' } 
});
const FormData = mongoose.model('FormData', formDataSchema);

// API endpoint to handle form submission
app.post('/api/submit-form', async (req, res) => {
  try {
    const formData = new FormData(req.body);
    await formData.save();
    res.status(201).json({ message: 'Form data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving form data', error: error.message });
  }
});

// Fetch all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await FormData.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Accept a booking
app.put('/api/bookings/:id/accept', async (req, res) => {
  try {
    const booking = await FormData.findByIdAndUpdate(req.params.id, { status: 'accepted' }, { new: true });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting booking', error: error.message });
  }
});

// Reject a booking
app.put('/api/bookings/:id/reject', async (req, res) => {
  try {
    const booking = await FormData.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting booking', error: error.message });
  }
});

// Endpoint to fetch dashboard statistics
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const activeRooms = await FormData.countDocuments({ status: 'accepted', endDate: { $gt: new Date() } });
    const newBookings = await FormData.countDocuments({ status: 'pending' });
    const numberOfUsers = await FormData.distinct('email').length;
    const ongoingBookings = await FormData.countDocuments({
      status: 'accepted',
      startDate: { $lte: new Date() },
      endDate: { $gt: new Date() }
    });
    const finishedBookings = await FormData.countDocuments({
      status: 'accepted',
      endDate: { $lte: new Date() }
    });

    res.json({
      activeRooms,
      newBookings,
      numberOfUsers,
      ongoingBookings,
      finishedBookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

// Fetch pending bookings
app.get('/api/pending-bookings', async (req, res) => {
  try {
    const bookings = await FormData.find({ status: 'pending' });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending bookings', error: error.message });
  }
});

// Fetch bookings by status
app.get('/api/bookings', async (req, res) => {
  const { status } = req.query;
  try {
    const bookings = await FormData.find({ status });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: `Error fetching ${status} bookings`, error: error.message });
  }
});

// API endpoint to fetch all submitted forms
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await FormData.find();
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching forms', error: error.message });
  }
});

// API endpoint to delete a form by ID
app.delete('/api/forms/:id', async (req, res) => {
  try {
    const deletedForm = await FormData.findByIdAndDelete(req.params.id);
    if (!deletedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json({ message: 'Form cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling form', error: error.message });
  }
});

// API endpoint to fetch rooms with their bookings
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await FormData.aggregate([
      { $group: { _id: '$room', bookings: { $push: '$$ROOT' } } },
      { $project: { room: '$_id', bookings: 1, _id: 0 } }
    ]);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms with bookings', error: error.message });
  }
});

// Maintenance schema and routes
const maintenanceSchema = new mongoose.Schema({
  name: String,
  room: String,
  reason: String,
  startDate: Date,
  endDate: Date
});

// New log schema
const logSchema = new mongoose.Schema({
name: String,
room: String,
reason: String,
startDate: Date,
endDate: Date,
completedDate: Date
});

const Log = mongoose.model('Log', logSchema);

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

// Modified add maintenance room
app.post('/api/maintenance', async (req, res) => {
try {
    const { name, room, reason, startDate, endDate } = req.body;

    const newMaintenance = new Maintenance({
        name,
        room,
        reason,
        startDate,
        endDate
    });

    await newMaintenance.save();
    res.status(201).json({ message: 'Maintenance room added successfully', maintenance: newMaintenance });
} catch (error) {
    res.status(500).json({ message: 'Error adding maintenance room', error: error.message });
}
});

// Get all maintenance rooms
app.get('/api/maintenance', async (req, res) => {
try {
  const maintenanceRooms = await Maintenance.find();
  res.json(maintenanceRooms);
} catch (error) {
  console.error('Error fetching maintenance rooms:', error);
  res.status(500).json({ message: 'Error fetching maintenance rooms', error: error.message });
}
});

// Modified remove maintenance room
app.delete('/api/maintenance/:id', async (req, res) => {
try {
    const deletedMaintenance = await Maintenance.findByIdAndDelete(req.params.id);
    if (!deletedMaintenance) {
        return res.status(404).json({ message: 'Maintenance room not found' });
    }

    // Add to log
    const logEntry = new Log({
        ...deletedMaintenance.toObject(),
        completedDate: new Date()
    });
    await logEntry.save();

    res.json({ message: 'Maintenance room removed successfully' });
} catch (error) {
    res.status(500).json({ message: 'Error removing maintenance room', error: error.message });
}
});

// Function to automatically remove expired maintenance rooms
const removeExpiredMaintenanceRooms = async () => {
try {
    const currentDate = new Date();
    const expiredRooms = await Maintenance.find({ endDate: { $lte: currentDate } });

    for (let room of expiredRooms) {
        // Add to log
        const logEntry = new Log({
            ...room.toObject(),
            completedDate: currentDate
        });
        await logEntry.save();

        // Remove from maintenance
        await Maintenance.findByIdAndDelete(room._id);
    }

    console.log(`Removed ${expiredRooms.length} expired maintenance rooms`);
} catch (err) {
    console.error('Error removing expired maintenance rooms:', err);
}
};

// Run removeExpiredMaintenanceRooms every hour
setInterval(removeExpiredMaintenanceRooms, 3600000);

// New endpoint to fetch maintenance logs
app.get('/api/maintenance-logs', async (req, res) => {
try {
    const logs = await Log.find().sort({ completedDate: -1 });
    res.json(logs);
} catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance logs', error: error.message });
}
});

// Endpoint to fetch dashboard statistics
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const activeRooms = await FormData.countDocuments({ status: 'accepted', endDate: { $gt: new Date() } });
    const newBookings = await FormData.countDocuments({ status: 'pending' });
    const numberOfUsers = await FormData.distinct('email').length;
    const ongoingBookings = await FormData.countDocuments({
      status: 'accepted',
      startDate: { $lte: new Date() },
      endDate: { $gt: new Date() }
    });
    const finishedBookings = await FormData.countDocuments({
      status: 'accepted',
      endDate: { $lte: new Date() }
    });

    res.json({
      activeRooms,
      newBookings,
      numberOfUsers,
      ongoingBookings,
      finishedBookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

// Fetch pending bookings
app.get('/api/pending-bookings', async (req, res) => {
  try {
    const bookings = await FormData.find({ status: 'pending' });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending bookings', error: error.message });
  }
});

const formAdminSchema = new mongoose.Schema({
  name: String,
  subject: String,
  startDate: Date,
  endDate: Date,
  email: [String],
  room: String,
  status: { type: String, default: 'pending' }
});
const FormAdmin = mongoose.model('FormAdmin', formAdminSchema);


// Function to handle submission of admin booking form
app.post('/api/submit-form-admin', async (req, res) => {
  try {
    const formAdminData = new FormAdmin(req.body);
    formAdminData.status = 'accepted'; // Automatically set status to accepted

    // Check for conflicting bookings in existing accepted bookings
    const conflictingBookings = await FormAdmin.find({
      room: formAdminData.room,
      $or: [
        { startDate: { $lt: formAdminData.endDate, $gte: formAdminData.startDate } },
        { endDate: { $gt: formAdminData.startDate, $lte: formAdminData.endDate } },
        { startDate: { $lte: formAdminData.startDate }, endDate: { $gte: formAdminData.endDate } }
      ],
      status: 'accepted'
    });

    // Reject conflicting bookings
    for (let booking of conflictingBookings) {
      booking.status = 'rejected';
      await booking.save();
    }

    // Save the admin booking
    await formAdminData.save();

    res.status(201).json({ 
      message: 'Admin booking accepted successfully',
      rejectedBookings: conflictingBookings.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving admin booking', error: error.message });
  }
});


// API endpoint to fetch all submitted forms (from FormAdmin collection)
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await FormAdmin.find();
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin forms', error: error.message });
  }
});

// API endpoint to fetch bookings by room and status
app.get('/api/bookings/:room/:status', async (req, res) => {
  const { room, status } = req.params;
  try {
    let bookings;
    if (status === 'accepted') {
      // Fetch from both FormData and FormAdmin collections
      const formDataBookings = await FormData.find({ room, status });
      const formAdminBookings = await FormAdmin.find({ room, status });
      bookings = [...formDataBookings, ...formAdminBookings];
    } else {
      bookings = await FormData.find({ room, status });
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: `Error fetching ${status} bookings for room ${room}`, error: error.message });
  }
});



// Function to combine bookings from formData and formAdmin collections
function combineBookings(formDataBookings, formAdminBookings) {
  const combinedBookings = [];

  // Add formData bookings
  formDataBookings.forEach(formData => {
    const roomIndex = combinedBookings.findIndex(item => item.room === formData.room);
    if (roomIndex === -1) {
      combinedBookings.push({ room: formData.room, bookings: formData.bookings });
    } else {
      combinedBookings[roomIndex].bookings.push(...formData.bookings);
    }
  });

  // Add formAdmin bookings
  formAdminBookings.forEach(formAdmin => {
    const roomIndex = combinedBookings.findIndex(item => item.room === formAdmin.room);
    if (roomIndex === -1) {
      combinedBookings.push({ room: formAdmin.room, bookings: formAdmin.bookings });
    } else {
      combinedBookings[roomIndex].bookings.push(...formAdmin.bookings);
    }
  });

  return combinedBookings;
}

// Fetch booking details by room number and time slot
app.get('/api/booking-details', async (req, res) => {
  const { room, startTime } = req.query;
  const startDate = new Date(parseInt(startTime));
  try {
    const booking = await FormData.findOne({
      room,
      status: 'accepted',
      startDate: { $lte: startDate },
      endDate: { $gt: startDate }
    }) || await FormAdmin.findOne({
      room,
      status: 'accepted',
      startDate: { $lte: startDate },
      endDate: { $gt: startDate }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      name: booking.name,
      subject: booking.subject
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking details', error: error.message });
  }
});

// Endpoint to reject a booking with a remark
app.put('/api/bookings/:id/reject', async (req, res) => {
  const { remark } = req.body;
  if (!remark || remark.length < 20 || remark.length > 250) {
    return res.status(400).json({ message: 'Remark must be between 20 and 250 characters.' });
  }

  try {
    const booking = await FormData.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Send rejection email
    emailjs.send(
      'service_kq4fexk',
      'template_89ow825',
      {
        to_name: booking.name,
        room: booking.room,
        status: 'rejected',
        hours: ((new Date(booking.endDate) - new Date(booking.startDate)) / 3600000).toFixed(2),
        time: `${new Date(booking.startDate).toLocaleString()} - ${new Date(booking.endDate).toLocaleString()}`,
        remark: remark,
        to_email: booking.email[0]
      },
      'vcNtyMqcMa4I1OXkL'
    );

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting booking', error: error.message });
  }
});

// API endpoint to get all bookings
app.get('/api/forms', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Function to return welcome message
app.post('/api/welcome', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const welcomeMessage = `Welcome, ${name}!`;
  res.status(200).json({ message: welcomeMessage });
});

const getDashboardStats = async () => {
try {
  const activeRooms = await FormData.countDocuments({ status: 'accepted', endDate: { $gt: new Date() } });
  const newBookings = await FormData.countDocuments({ status: 'pending' });
  const numberOfUsers = await FormData.distinct('email').length;
  const ongoingBookings = await FormData.countDocuments({
    status: 'accepted',
    startDate: { $lte: new Date() },
    endDate: { $gt: new Date() }
  });
  const finishedBookings = await FormData.countDocuments({
    status: 'accepted',
    endDate: { $lte: new Date() }
  });

  return {
    activeRooms,
    newBookings,
    numberOfUsers,
    ongoingBookings,
    finishedBookings
  };
} catch (error) {
  throw new Error('Error fetching dashboard stats: ' + error.message);
}
};



app.get('/api/dashboard-stats', async (req, res) => {
try {
  const stats = await getDashboardStats();
  res.json(stats);
} catch (error) {
  res.status(500).json({ message: error.message });
}
});


// Endpoint to fetch count of pending requests
app.get('/api/pending-requests-count', async (req, res) => {
try {
  const pendingRequestsCount = await FormData.countDocuments({ status: 'pending' });
  res.json({ pendingRequestsCount });
} catch (error) {
  res.status(500).json({ message: 'Error fetching pending requests count', error: error.message });
}
});


// API endpoint to fetch admin bookings
app.get('/api/admin-bookings', async (req, res) => {
try {
  const adminBookings = await FormAdmin.find().sort({ startDate: 1 });
  res.json(adminBookings);
} catch (error) {
  res.status(500).json({ message: 'Error fetching admin bookings', error: error.message });
}
});

// API endpoint to fetch user data 
app.get('/api/user/:username', async (req, res) => {
try {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ username: user.username });
} catch (error) {
  res.status(500).json({ message: 'Error fetching user data', error: error.message });
}
});

//new codes
const roomFinalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  description: String
});

const RoomFinal = mongoose.model('RoomFinal', roomFinalSchema, 'room-final');

// POST route to create a new room
app.post('/api/rooms-final', async (req, res) => {
  try {
    const { name, capacity, description } = req.body;
    const newRoom = new RoomFinal({ name, capacity, description });
    await newRoom.save();
    res.status(201).json({ message: 'Room added successfully', room: newRoom });
  } catch (error) {
    console.error('Error adding room:', error);
    res.status(500).json({ message: 'Error adding room', error: error.message });
  }
});

// GET route to retrieve all rooms
app.get('/api/rooms-final', async (req, res) => {
  try {
    const rooms = await RoomFinal.find();
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});

// DELETE route to remove a room
app.delete('/api/rooms-final/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const deletedRoom = await RoomFinal.findByIdAndDelete(roomId);
    
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json({ message: 'Room deleted successfully', room: deletedRoom });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Error deleting room', error: error.message });
  }
});

//new codes again 


const automodeSchema = new mongoose.Schema({
  roomName: { type: String, required: true },
  automode: { type: Boolean, required: true }
});

const Automode = mongoose.model('Automode', automodeSchema);

app.post('/api/automode', async (req, res) => {
  try {
      const { rooms } = req.body;

      if (!Array.isArray(rooms) || rooms.length === 0) {
          return res.status(400).json({ error: 'Rooms data is required' });
      }

      // Clear existing automode settings
      await Automode.deleteMany({});

      const automodePromises = rooms.map(async ({ roomName, automode }) => {
          const newAutomode = new Automode({
              roomName,
              automode
          });
          await newAutomode.save();
      });

      await Promise.all(automodePromises);

      res.status(201).json({ message: 'Automode status saved successfully' });
  } catch (error) {
      console.error('Error saving automode status:', error);
      res.status(500).json({ error: 'An error occurred while saving automode status' });
  }
});

app.get('/api/automode', async (req, res) => {
  try {
      const automodeRooms = await Automode.find();
      res.status(200).json(automodeRooms);
  } catch (error) {
      console.error('Error fetching automode status:', error);
      res.status(500).json({ error: 'An error occurred while fetching automode status' });
  }
});

//29-06
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find();
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
});


// Default endpoint
app.get('/', (req, res) => {
  res.send('Hello, welcome to the booking server!');
}); 

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
