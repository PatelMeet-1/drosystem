// src/component/PersonalProfile.jsx - SIMPLE USER VERSION
import React, { useState, useEffect } from "react";
import { Toast, ToastContainer, Button, Form, Card, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://drosystem-kjzk.onrender.com";

const PersonalProfile = () => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [memberId, setMemberId] = useState("");

  const user = localStorage.getItem("user");
  const token = localStorage.getItem("userToken"); // ✅ Token get karo

  useEffect(() => {
    if (user) {
      try {
        const userData = JSON.parse(user);
        setName(userData.name || "");
        setContact(userData.contact || "");
        setMemberId(userData.memberId || "");
      } catch (err) {
        console.error("User data parse error:", err);
      }
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // ✅ Correct endpoint with token
      const updateData = {
        name,
        contact,
      };
      
      // ✅ Password agar diya hai to add karo
      if (password && password.trim() !== "") {
        updateData.password = password;
      }

      const response = await axios.put(
        `${API_URL}/api/members/profile`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // ✅ Token send karo
          }
        }
      );

      if (response.data.success) {
        // ✅ Update localStorage with new data
        const updatedUser = {
          id: response.data.data._id || JSON.parse(user).id,
          memberId: response.data.data.memberId || memberId,
          name: response.data.data.name,
          contact: response.data.data.contact,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        setToastMessage("✅ Profile updated successfully!");
        setToastVariant("success");
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      setToastMessage(err.response?.data?.message || "❌ Failed to update profile");
      setToastVariant("danger");
    } finally {
      setLoading(false);
      setShowToast(true);
      setPassword(""); // Clear password
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="text-primary mb-3">👤 My Profile</h2>
        <Alert variant="info">
          Update your personal contact number and password
        </Alert>
      </div>

      <Card className="shadow-lg p-4 mx-auto" style={{ maxWidth: "500px" }}>
        <Form onSubmit={handleUpdate}>
          <Form.Group className="mb-3">
            <Form.Label><strong>Member ID</strong></Form.Label>
            <Form.Control
              type="text"
              value={memberId}
              disabled
              className="bg-light"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label><strong>Full Name</strong></Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label><strong>Contact Number</strong></Form.Label>
            <Form.Control
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label><strong>New Password (Optional)</strong></Form.Label>
            <Form.Control
              type="password"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" disabled={loading} className="w-100 btn-lg">
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              "💾 Update My Profile"
            )}
          </Button>
        </Form>
      </Card>

      <ToastContainer position="top-end">
        <Toast bg={toastVariant} show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default PersonalProfile;