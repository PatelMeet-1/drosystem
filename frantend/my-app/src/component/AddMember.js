import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Toast,
  ToastContainer,
  Button,
  Form,
  Card,
  Spinner,
  Table,
  Modal,
  Badge,
  Alert
} from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "https://drosystem.onrender.com";

const AddMember = () => {
  // Form states
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  
  // Data states
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  
  // UI states
  const [editMember, setEditMember] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [showToast, setShowToast] = useState(false);

  // Token & Config
  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // 🔥 FIXED - Fetch Members Function
  const fetchMembers = async () => {
    if (!token) {
      console.log("❌ No token found");
      setLoadingMembers(false);
      return;
    }

    try {
      setLoadingMembers(true);
      console.log("🔥 Fetching members...");
      
      const res = await axios.get(`${API_URL}/api/members/`, config);
      console.log("✅ Backend Response:", res.data);
      
      // Backend format: { success: true, data: [] }
      if (res.data.success && Array.isArray(res.data.data)) {
        setMembers(res.data.data);
        console.log("✅ Members loaded:", res.data.data.length);
      } else {
        console.log("❌ No data array:", res.data);
        setMembers([]);
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err.response?.status, err.response?.data);
      setMembers([]);
      showToastMsg("Failed to load members", "danger");
    } finally {
      setLoadingMembers(false);
    }
  };

  // 🔥 Toast Helper
  const showToastMsg = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  // 🔥 ASSIGN DRO ACCESS
  const assignDroAccess = async (memberName) => {
    if (!window.confirm(`Assign DRO access to ${memberName}?`)) return;
    
    try {
      const res = await axios.post(
        `${API_URL}/api/dro/admin/assign-dro-access`,
        { memberName },
        config
      );
      showToastMsg(res.data.message || `${memberName} ko DRO access de diya!`);
      fetchMembers(); // Refresh list
    } catch (err) {
      console.error('DRO Assign Error:', err);
      showToastMsg(err.response?.data?.message || 'Error assigning DRO access', "danger");
    }
  };

  // 🔥 SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res, payload;
      
      if (editMember) {
        // Update
        payload = { name, contact };
        if (password.trim()) {
          payload.password = password;
        }
        res = await axios.put(
          `${API_URL}/api/members/${editMember._id}`,
          payload,
          config
        );
        showToastMsg(res.data.message || "Member updated successfully!");
        setEditMember(null);
      } else {
        // Add new
        res = await axios.post(
          `${API_URL}/api/members/add`,
          { memberId, name, contact, password },
          config
        );
        showToastMsg(res.data.message || "Member added successfully!");
        setMemberId(""); setName(""); setContact(""); setPassword("");
      }

      setShowForm(false);
      fetchMembers();
    } catch (err) {
      console.error(err);
      showToastMsg(err.response?.data?.message || "Failed to save member", "danger");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/api/members/${id}`, config);
      showToastMsg("Member deleted!");
      fetchMembers();
    } catch (err) {
      showToastMsg("Delete failed", "danger");
    }
  };

  // 🔥 EDIT
  const handleEdit = (member) => {
    setEditMember(member);
    setMemberId(member.memberId);
    setName(member.name);
    setContact(member.contact);
    setPassword("");
    setShowForm(true);
  };

  // 🔥 RESET FORM
  const resetForm = () => {
    setEditMember(null);
    setMemberId(""); setName(""); setContact(""); setPassword("");
    setShowForm(false);
  };

  // 🔥 useEffect - PERFECT FIX
  useEffect(() => {
    console.log("🔥 Component mounted. Token:", !!token);
    if (token) {
      fetchMembers();
    } else {
      console.log("❌ No token - Please login first");
    }
  }, []); // Empty array = run once only

  return (
    <div className="container py-5">
      {/* Header & Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary mb-0">Members Management</h2>
        <Button 
          variant="success" 
          onClick={() => setShowForm(!showForm)}
          disabled={loadingMembers}
        >
          {showForm ? "Cancel" : "➕ Add Member"}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="shadow-lg border-0 p-4 mb-4">
          <h4 className="mb-4 text-primary">
            {editMember ? "✏️ Edit Member" : "➕ Add New Member"}
          </h4>
          
          <Form onSubmit={handleSubmit}>
            {!editMember && (
              <Form.Group className="mb-3">
                <Form.Label>Member ID <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter unique Member ID"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  required
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter phone number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password 
                {editMember && <span className="text-muted fs-6"> (optional)</span>}
              </Form.Label>
              <Form.Control
                type="password"
                placeholder={editMember ? "Leave blank to keep current" : "Enter password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!editMember}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={loading} className="flex-fill">
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {editMember ? "Updating..." : "Adding..."}
                  </>
                ) : editMember ? "Update Member" : "Add Member"}
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* Members Table */}
      <Card className="shadow-lg border-0">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">All Members ({members.length})</h5>
        </Card.Header>
        
        <Card.Body>
          {loadingMembers ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="me-2" />
              <p>Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <Alert variant="info" className="text-center">
              No members found. <Button variant="link" onClick={fetchMembers}>Refresh</Button>
            </Alert>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="d-none d-md-block">
                <Table striped bordered hover responsive className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Member ID</th>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>DRO Access</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, index) => (
                      <tr key={member._id}>
                        <td>{index + 1}</td>
                        <td><strong>{member.memberId}</strong></td>
                        <td>{member.name}</td>
                        <td>{member.contact}</td>
                        <td>
                          {member.droAccess?.enabled ? (
                            <Badge bg="success">✅ DRO Active</Badge>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline-success"
                              onClick={() => assignDroAccess(member.name)}
                            >
                              Assign DRO
                            </Button>
                          )}
                        </td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="warning" 
                            className="me-2" 
                            onClick={() => handleEdit(member)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger" 
                            onClick={() => handleDelete(member._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="d-block d-md-none">
                {members.map((member, index) => (
                  <Card key={member._id} className="mb-3 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <strong>#{index + 1}</strong>
                        <small className="text-muted">{member.memberId}</small>
                      </div>
                      <h6>{member.name}</h6>
                      <p className="mb-2">{member.contact}</p>
                      
                      <div className="mb-3">
                        {member.droAccess?.enabled ? (
                          <Badge bg="success">✅ DRO Active</Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline-success" 
                            onClick={() => assignDroAccess(member.name)}
                          >
                            Assign DRO
                          </Button>
                        )}
                      </div>
                      
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="warning" onClick={() => handleEdit(member)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(member._id)}>
                          Delete
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Toast */}
      <ToastContainer className="p-3" position="top-end">
        <Toast 
          bg={toastVariant} 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={4000} 
          autohide
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default AddMember;
