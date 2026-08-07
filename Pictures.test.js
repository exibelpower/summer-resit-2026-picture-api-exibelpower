const request = require("supertest");
const app = require("./app");
const { users, resetUsers } = require("./store");

beforeEach(resetUsers);

test("POST /register handles an invalid object and invalid email without registering", async () => {
  const response = await request(app).post("/register")
    .send({ email: "invalid-email", firstname: "Test", unexpected: "field" });
  expect(response.statusCode).toBe(400);
  expect(response.body.status).toBe("fail");
  expect(Object.keys(users)).toHaveLength(0);
});

test("POST /pictures/:email uploads a picture for a registered user", async () => {
  await request(app).post("/register")
    .send({ email: "picture@test.com", firstname: "Picture", lastname: "Owner" })
    .expect(201);
  const response = await request(app).post("/pictures/picture@test.com")
    .attach("picture", Buffer.from("fake image bytes"), "holiday.jpg");
  expect(response.statusCode).toBe(201);
  expect(response.body.data.pic).toBe("pic0");
  expect(response.body.data.picture.filename).toMatch(/^\d{10}\.jpg$/);
  expect(response.body.data.picture.size).toBe(16);
  expect(users["picture@test.com"].pic_count).toBe(1);
});

test("picture lifecycle supports descriptions, visibility, listing, and deactivation", async () => {
  const email = "life@test.com";
  await request(app).post("/register").send({ email, firstname: "Life", lastname: "Cycle" }).expect(201);
  await request(app).post(`/pictures/${email}`).attach("picture", Buffer.from("image"), "photo.png").expect(201);
  await request(app).put("/pictures").send({ email, pic: "pic0", description: "Test photo" }).expect(200);
  await request(app).put("/pictures/visible/false").send({ email, pic: "0" }).expect(200);
  const visible = await request(app).get(`/pictures/visible/${email}`).expect(200);
  expect(visible.body.data.pictures).toEqual({});
  const all = await request(app).get(`/pictures/${email}`).expect(200);
  expect(all.body.data.pictures.pic0.description).toBe("Test photo");
  await request(app).delete("/").send({ email }).expect(200);
  await request(app).get(`/pictures/${email}`).expect(400);
});

test("duplicate registration and unknown endpoints return JSend failures", async () => {
  const body = { email: "duplicate@test.com", firstname: "Duplicate", lastname: "User" };
  await request(app).post("/register").send(body).expect(201);
  expect((await request(app).post("/register").send(body).expect(400)).body.status).toBe("fail");
  expect((await request(app).get("/not-found").expect(404)).body.status).toBe("fail");
});
