import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
import './FormAd.css';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  subject: yup.string().max(50, 'Subject can be a maximum of 50 characters').required('Subject is required'),
  startDate: yup.date()
    .required('Start date and time are required')
    .min(new Date(), 'Start date must be in the future')
    .max(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'Booking is only allowed for the next month')
    .test('is-within-time', 'Time must be between 8:30 AM and 6:00 PM', (value) => {
      if (!value) return true;
      const hours = value.getHours();
      const minutes = value.getMinutes();
      return (hours > 8 || (hours === 8 && minutes >= 30)) && hours < 18;
    }),
  endDate: yup.date()
    .required('End date and time are required')
    .min(yup.ref('startDate'), 'End date must be after start date')
    .max(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'Booking is only allowed for the next month')
    .test('is-within-time', 'Time must be between 8:30 AM and 6:00 PM', (value) => {
      if (!value) return true;
      const hours = value.getHours();
      const minutes = value.getMinutes();
      return (hours > 8 || (hours === 8 && minutes >= 30)) && hours < 18;
    }),
  email: yup.array().of(yup.string().email('Invalid email format')).min(1, 'At least one email is required'),
  room: yup.string().required('Room is required')
});

const FormAd = () => {
  const [maintenanceRooms, setMaintenanceRooms] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState(null);

  useEffect(() => {
    const fetchMaintenanceRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/maintenance');
        setMaintenanceRooms(response.data.map(room => room.room));
      } catch (error) {
        console.error('Error fetching maintenance rooms:', error);
      }
    };

    fetchMaintenanceRooms();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '',
      subject: '',
      startDate: '',
      endDate: '',
      email: [],
      room: ''
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setFormDataToSubmit(values);
      setShowDialog(true);
    }
  });

  const roomOptions = Array.from({ length: 12 }, (_, i) => ({
    value: `Room ${i + 1}`,
    label: `Room ${i + 1}`,
    isDisabled: maintenanceRooms.includes(`Room ${i + 1}`)
  }));

  const handleEmailChange = (selectedOptions) => {
    const emails = selectedOptions ? selectedOptions.map(option => option.value) : [];
    formik.setFieldValue('email', emails);
  };

  // Calculate min and max dates for date inputs
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.setMonth(today.getMonth() + 1)).toISOString().split('T')[0];

  const handleDialogConfirm = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/submit-form-admin', formDataToSubmit);
      console.log(response.data);
      if (response.data.rejectedBookings > 0) {
        alert(`Form submitted successfully! ${response.data.rejectedBookings} conflicting booking(s) were rejected.`);
      } else {
        alert('Form submitted successfully!');
      }
      formik.resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
    setShowDialog(false);
  };

  const handleDialogCancel = () => {
    setShowDialog(false);
  };

  return (
    <>
      <div className="form-header">
        <h2>Booking Request</h2>
        <p>Please fill out the form below to submit your booking request.</p>
      </div>
      <form onSubmit={formik.handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
          />
          {formik.touched.name && formik.errors.name ? (
            <div className="error">{formik.errors.name}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            name="subject"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.subject}
          />
          {formik.touched.subject && formik.errors.subject ? (
            <div className="error">{formik.errors.subject}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date & Time</label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.startDate}
            min={`${minDate}T08:30`}
            max={`${maxDate}T18:00`}
          />
          {formik.touched.startDate && formik.errors.startDate ? (
            <div className="error">{formik.errors.startDate}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date & Time</label>
          <input
            id="endDate"
            name="endDate"
            type="datetime-local"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.endDate}
            min={`${minDate}T08:30`}
            max={`${maxDate}T18:00`}
          />
          {formik.touched.endDate && formik.errors.endDate ? (
            <div className="error">{formik.errors.endDate}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="email">Attendee Email(s)</label>
          <CreatableSelect
            id="email"
            isMulti
            options={formik.values.email.map(email => ({ value: email, label: email }))}
            onChange={handleEmailChange}
            onBlur={formik.handleBlur}
            value={formik.values.email.map(email => ({ value: email, label: email }))}
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="error">{formik.errors.email}</div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="room">Room</label>
          <Select
            id="room"
            options={roomOptions}
            onChange={option => formik.setFieldValue('room', option.value)}
            onBlur={formik.handleBlur}
            value={roomOptions.find(option => option.value === formik.values.room)}
            getOptionLabel={option => option.label}
            getOptionValue={option => option.value}
            isOptionDisabled={option => option.isDisabled}
          />
          {formik.touched.room && formik.errors.room ? (
            <div className="error">{formik.errors.room}</div>
          ) : null}
        </div>

        <button type="submit">Submit</button>
      </form>

      {showDialog && (
        <div className="overlay" onClick={handleDialogCancel}>
          <div className="dialog">
            <h3>Do you want to submit the form?</h3>
            <div className="dialog-actions">
              <button className="confirm-button" onClick={handleDialogConfirm}>Yes</button>
              <button className="cancel-button" onClick={handleDialogCancel}>No</button>
            </div>
          </div>
          <div class="copyright">
     <p>&copy; Shivangi Suyash. All rights reserved.</p>
    </div>
        </div>
      )}
    </>
  );
};

export default FormAd;
