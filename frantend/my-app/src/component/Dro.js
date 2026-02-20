import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Button, Table, Modal, Badge, Alert, Spinner 
} from 'react-bootstrap';
import { FaEye, FaCopy, FaDownload, FaSync } from 'react-icons/fa';

const Dro = () => {
  // 🔥 Role Detection
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const isAdmin = !!token;
  const isUser = !!user && !token;
  const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

  const [members, setMembers] = useState([]);
  const [droHistory, setDroHistory] = useState([]);
  const [showDroModal, setShowDroModal] = useState(false);
  const [selectedDro, setSelectedDro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔥 PERFECT RANDOM SHUFFLE
  const fisherYatesShuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/members/', config);
      setMembers(Array.isArray(res.data) ? res.data : res.data.data || []);
      setError('');
    } catch (err) {
      setError('No members found');
    }
  };

  const fetchDroHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/dro/history', config);
      setDroHistory(res.data || []);
    } catch {
      setDroHistory([]);
    }
  };

  // 🔥 DRO GENERATOR - ADMIN ONLY
  const generateDro = async () => {
    if (members.length === 0) {
      alert('Pehle Members page se members add karo!');
      return;
    }

    setLoading(true);
    try {
      const shuffledMembers = fisherYatesShuffle(members);
      
      const droData = {
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN', { hour12: true }),
        totalMembers: shuffledMembers.length,
        order: shuffledMembers.map((member, index) => ({
          position: index + 1,
          suffix: ['st', 'nd', 'rd'][index % 3] || 'th',
          name: member.name,
          memberId: member.memberId,
        }))
      };

      await axios.post('http://localhost:5000/api/dro/save', droData, config);
      fetchDroHistory();
      alert(`🎯 RANDOM DRO SAVED!\n1st: ${shuffledMembers[0].name}`);
    } catch (err) {
      alert('Error saving DRO');
    } finally {
      setLoading(false);
    }
  };

  const viewDro = (dro) => {
    setSelectedDro(dro);
    setShowDroModal(true);
  };

  const copyDro = () => {
    const text = selectedDro.order.map(item => 
      `${item.position}${item.suffix} - ${item.name}`
    ).join('\n');
    navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
  };

  const downloadDro = () => {
    const text = selectedDro.order.map(item => 
      `${item.position}${item.suffix} - ${item.name} (${item.memberId})`
    ).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DRO_${selectedDro.date}_${selectedDro.time}.txt`;
    a.click();
  };

  // 🔥 AUTO LOAD History
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const hasLogin = token || userData;
    
    if (hasLogin) {
      fetchDroHistory(); // ✅ ALWAYS for both
      if (token) {
        fetchMembers();   // ✅ Admin only
      }
    }
  }, [token]);

  return (
    <Container fluid className="px-3 px-md-4 py-3 py-md-5">
      <Row>
        <Col xs={12}>

          {/* 🔥 HEADER */}
          <div className="text-center mb-5">
            <h2 className="fw-bold text-primary mb-4">🎯 DRO Result</h2>
            
            {isAdmin ? (
              <Button
                variant="success"
                size="lg"
                className="w-100 w-md-auto px-5 py-3 fw-bold shadow-lg"
                onClick={generateDro}
                disabled={members.length === 0 || loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Generating...
                  </>
                ) : (
                  "🎯 CLICK THIS BTN GENERATE RANDOM DRO"
                )}
              </Button>
            ) : (
              <div className="alert alert-info">
                <h5>👤 User Mode</h5>
                <p className="mb-0"> Note:User Only Show result </p>
              </div>
            )}
          </div>

          {/* 🔥 ERROR */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* 🔥 HISTORY TABLE - WITH # Numbers */}
          <Card className="shadow-lg border-0 mt-5">
            <Card.Header className="bg-light p-4 d-flex justify-content-between">
              <h4 className="fw-bold mb-0">
                <FaSync className="me-2 text-primary" />
                DRO History
              </h4>
              {isAdmin && (
                <Button size="sm" variant="outline-primary" onClick={fetchDroHistory}>
                  Refresh
                </Button>
              )}
            </Card.Header>

            {/* ================= DESKTOP TABLE ================= */}
            <div className="d-none d-md-block table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>           {/* ✅ # Added */}
                    <th>Date</th>
                    <th>Time</th>
                    <th>Members</th>
                    <th>1st Winner</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {droHistory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No DRO History Found
                      </td>
                    </tr>
                  ) : (
                    droHistory.map((dro, index) => (
                      <tr key={dro._id}>
          
                        <td> {index + 1}</td>  
                        <td>{dro.date}</td>
                        <td>{dro.time}</td>
                        <td><Badge bg="info">{dro.totalMembers}</Badge></td>
                        <td>
                          <Badge bg="warning" text="dark">
                            {dro.order[0]?.name}
                          </Badge>
                        </td>
                        <td>
                          <Button size="sm" variant="outline-primary" onClick={() => viewDro(dro)}>
                            <FaEye /> View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {/* ================= MOBILE VIEW ================= */}
            <div className="d-md-none p-3">
              {droHistory.length === 0 ? (
                <p className="text-center text-muted py-5">No DRO History Found</p>
              ) : (
                droHistory.map((dro, index) => (
                  <Card key={dro._id} className="mb-3 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold text-primary">
                          <Badge bg="secondary" className="me-2">{index + 1}</Badge> {/* ✅ Mobile # */}
                          📅 {dro.date}
                        </h6>
                      </div>
                      <p className="mb-1">⏰ {dro.time}</p>
                      <p className="mb-1">
                        👥 Members: <Badge bg="info" className="ms-2">{dro.totalMembers}</Badge>
                      </p>
                      <p className="mb-3">
                        🏆 Winner: <Badge bg="warning" text="dark" className="ms-2">{dro.order[0]?.name}</Badge>
                      </p>
                      <Button variant="outline-primary" className="w-100" onClick={() => viewDro(dro)}>
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                ))
              )}
            </div>
          </Card>

          {/* ================= MODAL ================= */}
          <Modal show={showDroModal} onHide={() => setShowDroModal(false)} size="lg" centered fullscreen="md-down">
            <Modal.Header closeButton className="bg-success text-white">
              <Modal.Title>🎯 DRO Result - {selectedDro?.totalMembers || 0} Members</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* DESKTOP TABLE */}
              <div className="d-none d-md-block table-responsive">
                <Table bordered hover>
                  <thead className="table-success">
                    <tr>
                      <th>Pos</th>
                      <th>Name</th>
                      <th>Member ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDro?.order?.map((item, i) => (
                      <tr key={i} className={i === 0 ? "table-warning" : ""}>
                        <td><Badge bg="dark">{item.position}{item.suffix}</Badge></td>
                        <td>{item.name}</td>
                        <td>{item.memberId}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* MOBILE */}
              <div className="d-md-none">
                {selectedDro?.order?.map((item, i) => (
                  <Card key={i} className={`mb-3 ${i === 0 ? "border-warning" : ""}`}>
                    <Card.Body>
                      <h5 className={i === 0 ? "text-warning" : "text-success"}>
                        🏅 {item.position}{item.suffix}
                      </h5>
                      <p className="mb-1 fw-bold">👤 {item.name}</p>
                      <p className="mb-0 small text-muted">🆔 {item.memberId}</p>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDroModal(false)}>Close</Button>
              <Button variant="primary" onClick={copyDro}><FaCopy /> Copy</Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default Dro;
