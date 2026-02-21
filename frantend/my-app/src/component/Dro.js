import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Button, Table, Modal, Badge, Alert, Spinner 
} from 'react-bootstrap';
import { 
  FaEye, FaCopy, FaClock, FaSync, FaUserPlus, FaUserCheck, FaUserTimes, 
  FaToggleOn, FaToggleOff, FaStopwatch 
} from 'react-icons/fa';

// 🔥 SAFE TOSTRING FUNCTION
const safeToString = (value) => (value || 0).toString().padStart(2, '0');

const Dro = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const parsedUser = user ? JSON.parse(user) : null;
  const userName = parsedUser?.name || '';
  
  // 🔥 ALL STATES
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDroUser, setIsDroUser] = useState(false);
  const [members, setMembers] = useState([]);
  const [droHistory, setDroHistory] = useState([]);
  const [showDroModal, setShowDroModal] = useState(false);
  const [selectedDro, setSelectedDro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDroUsersPanel, setShowDroUsersPanel] = useState(false);
  const [membersWithStatus, setMembersWithStatus] = useState([]);
  const [adminMembersLoading, setAdminMembersLoading] = useState(false);
  const [droUsersLoading, setDroUsersLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmMemberName, setConfirmMemberName] = useState('');
  
  // 🔥 GLOBAL TIMER STATES - SAB USERS KE LIYE
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [globalTimer, setGlobalTimer] = useState({ hours: 0, minutes: 0, seconds: 5 });
  const [timerLoading, setTimerLoading] = useState(false);

  const publicConfig = { headers: { 'Content-Type': 'application/json' } };
  const privateConfig = token ? { 
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } 
  } : publicConfig;

  // 🔥 Fisher-Yates Shuffle - RANDOM ORDER
  const fisherYatesShuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 🔥 API FUNCTIONS
  const fetchMembersForDro = async () => {
    setMembersLoading(true);
    try {
      const res = await axios.get('https://drosystem-3.onrender.com/api/members/', publicConfig);
      setMembers(Array.isArray(res.data) ? res.data : res.data.data || []);
      setError('');
    } catch (err) {
      setError('Members not available');
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchDroHistory = async () => {
    try {
      const res = await axios.get('https://drosystem-3.onrender.com/api/dro/history', privateConfig);
      setDroHistory(res.data || []);
    } catch (err) {
      setDroHistory([]);
    }
  };

  // 🔥 GLOBAL TIMER FETCH - SAB USERS KE LIYE
  const fetchGlobalTimer = async () => {
    try {
      const res = await axios.get('https://drosystem-3.onrender.com/api/dro/get-timer', privateConfig);
      setGlobalTimer(res.data.timer || { hours: 0, minutes: 0, seconds: 5 });
    } catch (err) {
      setGlobalTimer({ hours: 0, minutes: 0, seconds: 5 });
    }
  };

  const fetchMembersWithDroStatus = async () => {
    if (!token) return;
    setAdminMembersLoading(true);
    try {
      const res = await axios.get('https://drosystem-3.onrender.com/api/dro/members-with-status', privateConfig);
      setMembersWithStatus(res.data || []);
    } catch (err) {
      setMembersWithStatus([]);
    } finally {
      setAdminMembersLoading(false);
    }
  };

  const checkCurrentUserDroStatus = async () => {
    if (!userName) return;
    try {
      const res = await axios.get(`https://drosystem-3.onrender.com/api/dro/check/${encodeURIComponent(userName)}`);
      setIsDroUser(res.data.hasDroAccess);
    } catch (err) {
      setIsDroUser(false);
    }
  };

  // 🔥 DIRECT DRO GENERATE - GLOBAL TIMER USE
  const generateDroDirect = async () => {
    if (members.length === 0) {
      alert('❌ Pehle Members page se members add karo!');
      return;
    }
    
    if (globalTimer.hours === 0 && globalTimer.minutes === 0 && globalTimer.seconds === 0) {
      alert('⚠️ Pehle TIMER set karo! (Admin ko bol do)');
      return;
    }

    setLoading(true);
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

    try {
      await axios.post('https://drosystem-3.onrender.com/api/dro/save', droData, privateConfig);
      await fetchDroHistory();
      alert(`🎉 DRO SAVED!\n⏰ Auto-delete: ${safeToString(globalTimer.hours)}h:${safeToString(globalTimer.minutes)}m:${safeToString(globalTimer.seconds)}s\n🥇 1st: ${shuffledMembers[0].name}`);
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.message || 'Failed to save DRO'}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SET GLOBAL TIMER - ADMIN ONLY
  const handleSetGlobalTimer = async () => {
    setTimerLoading(true);
    try {
      await axios.post('https://drosystem-3.onrender.com/api/dro/set-timer', globalTimer, privateConfig);
      alert(`✅ GLOBAL TIMER SET!\n${safeToString(globalTimer.hours)}h:${safeToString(globalTimer.minutes)}m:${safeToString(globalTimer.seconds)}s\n💥 Sab users ke naye DRO isme delete honge!`);
      await fetchGlobalTimer(); // Refresh
      setShowTimerModal(false);
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.message || 'Failed to set timer'}`);
    } finally {
      setTimerLoading(false);
    }
  };

  const handleTimerChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    if (field === 'hours' && numValue > 23) return;
    if ((field === 'minutes' || field === 'seconds') && numValue > 59) return;
    setGlobalTimer(prev => ({ ...prev, [field]: numValue }));
  };

  // 🔥 TIMER DISPLAY
  const getTimerDisplay = (dro) => {
    if (!dro) return '00:00:05';
    return `${safeToString(dro.hours)}:${safeToString(dro.minutes)}:${safeToString(dro.seconds)}`;
  };

  const toggleDroAccess = (memberName, currentStatus) => {
    setConfirmMemberName(memberName);
    setConfirmAction(currentStatus ? 'remove' : 'assign');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    setDroUsersLoading(true);
    try {
      const endpoint = confirmAction === 'assign' 
        ? '/api/dro/admin/assign-dro-access'
        : '/api/dro/admin/remove-dro-access';
      await axios.post(`https://drosystem-3.onrender.com/${endpoint}`, { memberName: confirmMemberName }, privateConfig);
      alert(`${confirmMemberName} ka DRO access ${confirmAction === 'assign' ? 'de diya!' : 'hata diya!'}`);
      await fetchMembersWithDroStatus();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setDroUsersLoading(false);
      setShowConfirmModal(false);
    }
  };

  const viewDro = (dro) => {
    setSelectedDro(dro);
    setShowDroModal(true);
  };

  const copyDro = () => {
    const text = selectedDro?.order?.map(item => `${item.position}${item.suffix} - ${item.name}`).join('\n') || '';
    navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
  };

  // 🔥 INIT - SAB USERS GLOBAL TIMER FETCH KAREGA
  useEffect(() => {
    const init = async () => {
      setIsAdmin(!!token);
      await Promise.all([fetchDroHistory(), fetchMembersForDro()]);
      
      // 🔥 GLOBAL TIMER - SAB USERS KE LIYE
      await fetchGlobalTimer();
      
      if (parsedUser && !token) await checkCurrentUserDroStatus();
      if (token) await fetchMembersWithDroStatus();
    };
    init();
  }, [token, userName]);

  const droUsersCount = membersWithStatus.filter(m => m.droAccess?.enabled).length;
  const canGenerateDro = isAdmin || isDroUser;
  const buttonDisabled = members.length === 0 || loading || membersLoading;
  const timerSet = globalTimer.hours + globalTimer.minutes + globalTimer.seconds > 0;

return (
  <Container fluid className="px-3 px-md-4 py-3 py-md-5 min-vh-100 bg-white">
    <Row>
      <Col xs={12}>
        {/* HEADER */}
        <div className="text-center mb-5">
          <h1 className="fw-bold text-dark mb-4 h2">🎯 DRO Result System</h1>
          <p className="lead text-muted mb-4">Admin set karega timer - Sab users same time use karenge!</p>
          
          {/* GLOBAL TIMER DISPLAY */}
          <Alert variant={timerSet ? "info" : "secondary"} className="text-center mb-4">
            <FaStopwatch className="me-2 fs-5 text-primary" />
            <strong>Current Global Timer:</strong> 
            <span className="h3 fw-bold text-dark ms-2">
              {safeToString(globalTimer.hours)}h : {safeToString(globalTimer.minutes)}m : {safeToString(globalTimer.seconds)}s
            </span>
            {isAdmin && (
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="ms-3 fw-bold"
                onClick={() => setShowTimerModal(true)}
              >
                <FaClock className="me-1" /> Change Timer
              </Button>
            )}
            {!timerSet && (
              <div className="mt-2 small text-warning">
                ⚠️ Admin ko timer set karne ko bolo!
              </div>
            )}
          </Alert>

          {/* GENERATE DRO BUTTON */}
          {canGenerateDro ? (
            <Button
              variant="primary"
              size="lg"
              className="w-100 w-md-auto px-5 py-3 fw-bold shadow mb-4"
              onClick={generateDroDirect}
              disabled={buttonDisabled || !timerSet}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  <span className="fw-bold">Generating DRO...</span>
                </>
              ) : (
                <>
                  <span className="me-3">🎲</span>
                  <span>GENERATE DRO NOW</span>
                  <Badge bg="light" text="dark" className="ms-3">{members.length} Members</Badge>
                </>
              )}
            </Button>
          ) : (
            <Alert variant="secondary" className="text-center">
              <h4 className="mb-3">🔒 No DRO Access</h4>
              <p>Admin se DRO access maango!</p>
            </Alert>
          )}

          {/* ADMIN PANEL BUTTON */}
          {isAdmin && (
            <Button
              variant="outline-primary"
              size="lg"
              className="w-100 w-md-auto px-5 py-3 fw-bold shadow"
              onClick={() => setShowDroUsersPanel(!showDroUsersPanel)}
            >
              <FaUserPlus className="me-2" /> 
              Manage DRO Users 
              <Badge bg="primary" className="ms-2">{droUsersCount}</Badge>
            </Button>
          )}
        </div>

        {/* MEMBERS COUNT */}
        {canGenerateDro && (
          <Alert variant="info" className="text-center mb-4">
            📊 Available Members: <strong className="h3 text-primary">{members.length}</strong>
          </Alert>
        )}

        {/* ERROR */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="shadow">
            {error}
          </Alert>
        )}

        {/* ADMIN PANEL - MOBILE RESPONSIVE */}
        {isAdmin && showDroUsersPanel && (
          <Card className="shadow mb-5 border-0">
            <Card.Header className="bg-light border-bottom">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h3 className="mb-0 fw-bold text-dark h5">
                  <FaUserPlus className="me-2 text-primary" /> DRO Users Management ({membersWithStatus.length})
                </h3>
                <Button 
                  size="sm" 
                  variant="outline-primary" 
                  onClick={fetchMembersWithDroStatus} 
                  disabled={adminMembersLoading}
                >
                  <FaSync className="me-1" /> Refresh
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {/* DESKTOP TABLE VIEW */}
              <div className="d-none d-md-block">
                <div className="table-responsive">
                  <Table striped bordered hover className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>ID</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {membersWithStatus.map((member, index) => (
                        <tr key={member._id || member.memberId}>
                          <td className="fw-bold">{index + 1}</td>
                          <td><strong>{member.name}</strong></td>
                          <td><Badge bg="info">{member.memberId}</Badge></td>
                          <td>
                            {member.droAccess?.enabled ? (
                              <Badge bg="success">
                                <FaToggleOn className="me-1" /> Active
                              </Badge>
                            ) : (
                              <Badge bg="secondary">
                                <FaToggleOff className="me-1" /> Inactive
                              </Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant={member.droAccess?.enabled ? "outline-danger" : "outline-success"}
                              className="fw-bold"
                              onClick={() => toggleDroAccess(member.name, member.droAccess?.enabled)}
                              disabled={droUsersLoading}
                            >
                              {member.droAccess?.enabled ? 'Remove' : 'Grant'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="d-md-none p-3">
                <div className="row g-3">
                  {membersWithStatus.map((member, index) => (
                    <div key={member._id || member.memberId} className="col-12">
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="fw-bold fs-6 text-dark">#{index + 1}</div>
                            <div>
                              {member.droAccess?.enabled ? (
                                <Badge bg="success" className="fs-6 px-3 py-2">
                                  <FaToggleOn className="me-1" /> Active
                                </Badge>
                              ) : (
                                <Badge bg="secondary" className="fs-6 px-3 py-2">
                                  <FaToggleOff className="me-1" /> Inactive
                                </Badge>
                              )}
                            </div>
                          </div>
                          <h5 className="fw-bold mb-2">{member.name}</h5>
                          <Badge bg="info" className="mb-2 fs-6 px-3 py-2">ID: {member.memberId}</Badge>
                          <div className="mt-3">
                            <Button
                              size="sm"
                              variant={member.droAccess?.enabled ? "outline-danger" : "outline-success"}
                              className="w-100 fw-bold py-2"
                              onClick={() => toggleDroAccess(member.name, member.droAccess?.enabled)}
                              disabled={droUsersLoading}
                            >
                              {member.droAccess?.enabled ? 'Remove Access' : 'Grant Access'}
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* DRO HISTORY - MOBILE RESPONSIVE */}
        <Card className="shadow border-0">
          <Card.Header className="bg-light border-bottom p-3">
            <h2 className="mb-0 fw-bold text-dark h4">📋 DRO History ({droHistory.length})</h2>
          </Card.Header>
          
          {/* DESKTOP TABLE VIEW */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <Table striped bordered hover responsive className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>🥇 1st</th>
                    <th>Total</th>
                    <th>⏰ Timer</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {droHistory.map((dro, index) => (
                    <tr key={dro._id || index}>
                      <td className="fw-bold">{index + 1}</td>
                      <td className="fw-semibold">{dro.date}</td>
                      <td><Badge bg="primary">{dro.time}</Badge></td>
                      <td>
                        <Badge bg="warning" className="fw-bold px-3 py-1">
                          {dro.order?.[0]?.name || 'N/A'}
                        </Badge>
                      </td>
                      <td><Badge bg="secondary">{dro.totalMembers}</Badge></td>
                      <td>
                        <Badge 
                          bg="info" 
                          className="px-3 py-2 fw-bold"
                          style={{ minWidth: '120px' }}
                        >
                          <FaClock className="me-1" />
                          {getTimerDisplay(dro)}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          className="fw-bold"
                          onClick={() => viewDro(dro)}
                        >
                          <FaEye className="me-1" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          {/* MOBILE CARD VIEW FOR HISTORY */}
          <div className="d-md-none p-3">
            <div className="row g-3">
              {droHistory.map((dro, index) => (
                <div key={dro._id || index} className="col-12">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="fw-bold h5">#{index + 1}</div>
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          className="fw-bold px-3"
                          onClick={() => viewDro(dro)}
                        >
                          <FaEye className="me-1" /> View
                        </Button>
                      </div>
                      
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <small className="text-muted">📅 Date</small>
                          <div className="fw-semibold">{dro.date}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">🕒 Time</small>
                          <Badge bg="primary" className="mt-1 w-100 text-start py-2">{dro.time}</Badge>
                        </div>
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-8">
                          <small className="text-muted">🥇 1st Place</small>
                          <Badge bg="warning" className="mt-1 w-100 text-start py-2 fw-bold">
                            {dro.order?.[0]?.name || 'N/A'}
                          </Badge>
                        </div>
                        <div className="col-4">
                          <small className="text-muted">👥 Total</small>
                          <Badge bg="secondary" className="mt-1 w-100 text-start py-2">{dro.totalMembers}</Badge>
                        </div>
                      </div>

                      <div className="mb-3">
                        <small className="text-muted">⏰ Timer</small>
                        <Badge 
                          bg="info" 
                          className="mt-1 w-100 text-start py-2 fw-bold d-block"
                          style={{ fontSize: '0.9rem' }}
                        >
                          <FaClock className="me-1" />
                          {getTimerDisplay(dro)}
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* DRO RESULT MODAL - RESPONSIVE */}
        <Modal show={showDroModal} onHide={() => setShowDroModal(false)} size="xl" className="dro-result-modal">
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title className="fw-bold h3">🎯 DRO Complete Result</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedDro && (
              <Alert variant="info" className="mb-4 text-center p-4">
                <FaClock className="me-3 fs-3 text-primary" />
                <span className="fs-4 fw-bold">Auto-delete in:</span><br/>
                <span className="h2 text-primary fw-bold">
                  {getTimerDisplay(selectedDro)}
                </span>
              </Alert>
            )}
            <div className="table-responsive">
              <Table className="mb-0">
                <thead className="table-primary">
                  <tr>
                    <th className="fs-5">Position</th>
                    <th className="fs-5">Member Name</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDro?.order?.map((item, i) => (
                    <tr key={i} className={i === 0 ? 'table-warning' : ''}>
                      <td className={`fw-bold fs-3 text-center ${i === 0 ? 'text-warning' : ''}`}>
                        {item.position}{item.suffix}
                      </td>
                      <td className={`fw-bold fs-2 ${i === 0 ? 'text-warning' : ''}`}>
                        {item.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="lg" onClick={() => setShowDroModal(false)}>
              Close
            </Button>
            <Button variant="primary" size="lg" onClick={copyDro}>
              <FaCopy className="me-2" /> Copy Full Results
            </Button>
          </Modal.Footer>
        </Modal>

        {/* GLOBAL TIMER MODAL - ADMIN ONLY */}
        <Modal show={showTimerModal} onHide={() => setShowTimerModal(false)} centered size="sm">
          <Modal.Header closeButton className="bg-light text-dark border-bottom">
            <Modal.Title className="fw-bold">
              <FaClock className="me-2 text-primary" /> Set GLOBAL Timer
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center p-4">
            <h4 className="mb-4 text-dark fw-bold">Sab users ke DRO is time mein delete honge:</h4>
            
            <div className="row g-3 justify-content-center mb-4">
              <div className="col-4">
                <input
                  type="number"
                  className="form-control form-control-lg text-center fw-bold text-primary border-primary"
                  style={{ height: '60px', fontSize: '1.5rem' }}
                  value={globalTimer.hours}
                  onChange={(e) => handleTimerChange('hours', e.target.value)}
                  min="0" max="23"
                />
                <div className="text-muted fw-bold mt-1 small">Hours</div>
              </div>
              <div className="col-4">
                <input
                  type="number"
                  className="form-control form-control-lg text-center fw-bold text-warning border-warning"
                  style={{ height: '60px', fontSize: '1.5rem' }}
                  value={globalTimer.minutes}
                  onChange={(e) => handleTimerChange('minutes', e.target.value)}
                  min="0" max="59"
                />
                <div className="text-muted fw-bold mt-1 small">Minutes</div>
              </div>
              <div className="col-4">
                <input
                  type="number"
                  className="form-control form-control-lg text-center fw-bold text-info border-info"
                  style={{ height: '60px', fontSize: '1.5rem' }}
                  value={globalTimer.seconds}
                  onChange={(e) => handleTimerChange('seconds', e.target.value)}
                  min="0" max="59"
                />
                <div className="text-muted fw-bold mt-1 small">Seconds</div>
              </div>
            </div>
            
            <div className="alert alert-info shadow p-4 mb-3">
              <h3 className="mb-0 fw-bold text-center text-primary small">
                ⏰ GLOBAL TIMER PREVIEW:
              </h3>
              <div className="h3 fw-bold text-primary mt-2">
                {safeToString(globalTimer.hours)} : {safeToString(globalTimer.minutes)} : {safeToString(globalTimer.seconds)}
              </div>
              <div className="mt-2 fs-6 text-dark">Sab naye DRO is exact time mein delete honge!</div>
            </div>

            {!timerSet && (
              <Alert variant="warning" className="text-center fw-bold">
                ⚠️ Kam se kam 1 second set karo!
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => {
                setShowTimerModal(false);
                fetchGlobalTimer(); // Reset to current
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="lg"
              className="px-5 fw-bold"
              onClick={handleSetGlobalTimer}
              disabled={timerLoading || !timerSet}
            >
              {timerLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Setting Timer...
                </>
              ) : (
                '🚀 SET GLOBAL TIMER'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* CONFIRM MODAL */}
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered size="md">
          <Modal.Header closeButton className="bg-light text-dark border-bottom">
            <Modal.Title className="fw-bold h5">
              {confirmAction === 'assign' ? 'Grant Access' : 'Remove Access'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <h3 className="mb-3 fw-bold">{confirmMemberName}</h3>
            <h5 className="text-capitalize">
              {confirmAction === 'assign' ? 'KO DRO ACCESS DENA?' : 'KA DRO ACCESS HATAO?'}
            </h5>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="lg" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button 
              size="lg"
              variant={confirmAction === 'assign' ? "primary" : "outline-danger"} 
              className="px-4 fw-bold"
              onClick={handleConfirmAction}
            >
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  </Container>
);


};

export default Dro;
