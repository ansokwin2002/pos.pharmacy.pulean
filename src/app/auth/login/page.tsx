'use client';

import { useState } from 'react';
import { Box, Container, Flex, Heading, Text, Button, Link, Card, IconButton, TextField } from '@radix-ui/themes';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { usePageTitle } from '@/hooks/usePageTitle';
import { login as apiLogin, saveAuth } from '@/utilities/api/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
  usePageTitle('Login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await apiLogin({ email, password });
      saveAuth(res.access_token);
      toast.success('Login successful');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      const detail = error?.detail;
      const message = detail?.message || detail?.errors?.email?.[0] || 'Login failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Flex className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-12" direction="column" justify="center" align="center">
        <Box className="flex-grow"></Box>
        
        <Box className="text-center" mb="6">
          <Flex direction="column" align="center" gap="4">
            <BrandLogo size={24} showText={true} />
            <Heading size="5">Login to your account</Heading>
          </Flex>
        </Box>

        <Container size="2" className="max-w-md w-full mx-auto">
          <Card size="3">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Text size="2" color="red">{error}</Text>
              )}
              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">Email Address</Text>
                <TextField.Root 
                  type="email"
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                >
                  <TextField.Slot>
                    <Mail size={16} />
                  </TextField.Slot>
                </TextField.Root>
              </Flex>

              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">Password</Text>
                <TextField.Root
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                >
                  <TextField.Slot>
                    <Lock size={16} />
                  </TextField.Slot>
                  <TextField.Slot>
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="gray"
                      onClick={togglePasswordVisibility}
                      className="p-0 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </TextField.Slot>
                </TextField.Root>
              </Flex>

              <Box>
                <Button 
                  type="submit"
                  className="!w-full"
                  disabled={isLoading}
                  size="3"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </Box>
            </form>
          </Card>
          <Box className="text-center mt-4">
            <Link href="/auth/forgot-password" size="1" color="gray">
              Forgot password?
            </Link>
          </Box>
        </Container>
        
        <Box className="text-center mt-8 mb-4">
          <Text as="p" size="1" color="gray">
            © {new Date().getFullYear()} Punleukrek Pharmacy. All rights reserved.
          </Text>
          <Text as="p" size="1" color="gray">
            Version 1.0.0 (Build 001)
          </Text>
        </Box>
      </Flex>
  );
}
