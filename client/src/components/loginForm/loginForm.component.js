import React, { useContext } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { FormWrapper } from "./loginForm.styles";
import { MovieAPIContext } from "../../contexts/movie-api-provider";

function LoginForm() {
  const { login } = useContext(MovieAPIContext);
  return (
    <FormWrapper>
      <h1>Login Page</h1>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" placeholder="Enter email" />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" />
      </Form.Group>
      <Button variant="primary" type="submit">
        Submit
      </Button>
      <div style={{ marginTop: "30px" }}>
        Don't have an account? <a href="/register">register here</a>
      </div>
    </FormWrapper>
  );
}

export default LoginForm;
