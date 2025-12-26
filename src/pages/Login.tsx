import { useState } from "react";
import { useAppDispatch, useAppSelector, loginAsync } from "@/store";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody } from "@heroui/card";

const Login = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState("analyst");
  const [password, setPassword] = useState("s3cur3");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(loginAsync({ username, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-default-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 pb-2 pt-6">
          <h1 className="text-2xl font-bold">Security Operations Center</h1>
          <p className="text-small text-default-500">
            Incident Dashboard Login
          </p>
        </CardHeader>
        <CardBody className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onValueChange={setUsername}
              isRequired
              autoComplete="username"
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onValueChange={setPassword}
              isRequired
              autoComplete="current-password"
            />
            {error && <div className="text-danger text-sm">{error}</div>}
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
