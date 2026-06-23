import request from 'supertest';
import { createApp } from '../../app';

describe('Integración de la API de la Plataforma de Investigación', () => {
  const app = createApp();
  let adminToken: string;
  let studentToken: string;
  let otherStudentToken: string;
  let cleanerToken: string;

  let studentId: string;
  let otherStudentId: string;
  let projectId: string;
  let otherProjectId: string;
  let paperId: string;

  // 1. LOGIN ADMIN (Sembrado predeterminado)
  it('1. Debe loguear al Admin predeterminado', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'admin@research.com',
        password: 'adminpassword123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    adminToken = res.body.token;
  });

  // 2. CREACIÓN DE ESTUDIANTES
  it('2. Debe permitir registrar un estudiante', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        name: 'Estudiante Juan',
        email: 'juan@research.com',
        password: 'password123',
        role: 'STUDENT'
      });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('STUDENT');
    studentId = res.body.id;

    // Loguearse para obtener el token del estudiante
    const loginRes = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'juan@research.com',
        password: 'password123'
      });
    studentToken = loginRes.body.token;
  });

  it('Debe registrar otro estudiante', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        name: 'Estudiante Maria',
        email: 'maria@research.com',
        password: 'password123',
        role: 'STUDENT'
      });

    expect(res.status).toBe(201);
    otherStudentId = res.body.id;

    const loginRes = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'maria@research.com',
        password: 'password123'
      });
    otherStudentToken = loginRes.body.token;
  });

  // 3. CREACIÓN DE PROYECTOS POR ADMIN
  it('3. Debe permitir al Admin crear proyectos asignados a estudiantes', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Proyecto IA',
        description: 'Proyecto sobre redes profundas.',
        studentId: studentId
      });

    expect(res.status).toBe(201);
    expect(res.body.studentId).toBe(studentId);
    projectId = res.body.id;

    const otherRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Proyecto Física Cuántica',
        description: 'Computación cuántica básica.',
        studentId: otherStudentId
      });
    otherProjectId = otherRes.body.id;
  });

  it('No debe permitir a un estudiante crear proyectos', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Intento de Proyecto',
        description: 'Debería fallar.',
        studentId: studentId
      });

    expect(res.status).toBe(403);
  });

  // 4. CARGA DE PAPERS E ISOLATION
  it('4. Debe permitir al estudiante asignado subir un paper a su proyecto', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${projectId}/papers`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Análisis de Redes Neuronales',
        abstract: 'Este abstract cumple con los requerimientos mínimos de caracteres.',
        authors: ['Juan Perez', 'Profesor X'],
        fileUrl: 'https://cdn.org/paper.pdf'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('PENDING_REVIEW');
    paperId = res.body.id;
  });

  it('Debe prohibir a un estudiante subir un paper a un proyecto ajeno', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${otherProjectId}/papers`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Intrusión en Física Cuántica',
        abstract: 'Este abstract también cumple los caracteres mínimos.',
        authors: ['Juan Perez'],
        fileUrl: 'https://cdn.org/hacked.pdf'
      });

    expect(res.status).toBe(403);
  });

  // 5. REGISTRO Y LOGIN DE DATA CLEANER
  it('5. Debe registrar y loguear un Data Cleaner', async () => {
    const regRes = await request(app)
      .post('/api/v1/users/register')
      .send({
        name: 'Carlos Cleaner',
        email: 'carlos@research.com',
        password: 'password123',
        role: 'DATA_CLEANER'
      });

    expect(regRes.status).toBe(201);

    const loginRes = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'carlos@research.com',
        password: 'password123'
      });

    expect(loginRes.status).toBe(200);
    cleanerToken = loginRes.body.token;
  });

  // 6. LIMPIEZA / REVISIÓN DE PAPER
  it('6. Debe permitir al Data Cleaner limpiar el paper con datos válidos', async () => {
    const res = await request(app)
      .put(`/api/v1/projects/papers/${paperId}/review`)
      .set('Authorization', `Bearer ${cleanerToken}`)
      .send({
        status: 'APPROVED',
        isCleaned: true,
        cleanDataJson: '{"accuracy": 98.4}',
        ranking: 'Q1'
      });

    expect(res.status).toBe(200);
    expect(res.body.isCleaned).toBe(true);
    expect(res.body.ranking).toBe('Q1');
  });

  it('Debe rechazar si el Data Cleaner intenta modificar campos originales del paper', async () => {
    const res = await request(app)
      .put(`/api/v1/projects/papers/${paperId}/review`)
      .set('Authorization', `Bearer ${cleanerToken}`)
      .send({
        status: 'APPROVED',
        isCleaned: true,
        cleanDataJson: '{}',
        ranking: 'Q1',
        title: 'TÍTULO TOTALMENTE ALTERADO',
        fileUrl: 'https://cdn.org/alterado.pdf'
      });

    expect(res.status).toBe(403);
  });

  it('Debe rechazar si se intenta asignar un ranking inválido', async () => {
    const res = await request(app)
      .put(`/api/v1/projects/papers/${paperId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'APPROVED',
        isCleaned: true,
        cleanDataJson: '{}',
        ranking: 'Q5' // Invalid
      });

    expect(res.status).toBe(400);
  });

  // 7. VERIFICACIÓN DE LECTURA E ISOLATION
  it('7. Estudiante asignado debe ver todos los papers del proyecto', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.papers.length).toBe(1);
  });

  it('Estudiante ajeno no debe ver papers pendientes de aprobación', async () => {
    // Subir un paper al proyecto de Maria que se mantenga PENDING_REVIEW
    const resPaper = await request(app)
      .post(`/api/v1/projects/${otherProjectId}/papers`)
      .set('Authorization', `Bearer ${otherStudentToken}`)
      .send({
        title: 'Paper Cuántico Pendiente',
        abstract: 'Este abstract cumple con los requerimientos mínimos de caracteres.',
        authors: ['Maria Gomez'],
        fileUrl: 'https://cdn.org/quantum-pending.pdf'
      });

    expect(resPaper.status).toBe(201);

    // Juan lee el proyecto de Maria. Al estar PENDING_REVIEW, Juan no debería verlo en los resultados.
    const res = await request(app)
      .get(`/api/v1/projects/${otherProjectId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    // Juan no ve el paper pendiente de Maria
    expect(res.body.papers.length).toBe(0);
  });

  // 8. OBTENER USUARIOS Y SANITIZACIÓN (GET /api/v1/users)
  it('8. Debe permitir al Admin listar usuarios filtrando por rol STUDENT', async () => {
    const res = await request(app)
      .get('/api/v1/users?role=STUDENT')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(2); // Juan y Maria

    // Validar que todos los usuarios devueltos tienen rol STUDENT
    res.body.forEach((u: any) => {
      expect(u.role).toBe('STUDENT');
      // VALIDACIÓN MANDATORIA: Contraseña nunca debe exponerse
      expect(u).not.toHaveProperty('password');
      expect(u).not.toHaveProperty('passwordHash');
      expect(u).not.toHaveProperty('password_hash');
    });
  });

  it('Debe prohibir a un estudiante listar usuarios (Acceso RBAC)', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });
});
