'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Flex, Heading, Text, Button, Link, Card, IconButton, TextField } from '@radix-ui/themes';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Image from 'next/image';
import BrandLogo from '@/components/common/BrandLogo';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { usePageTitle } from '@/hooks/usePageTitle';
import { register as apiRegister, saveAuth } from '@/utilities/api/auth';
import { toast } from 'sonner';

export default function RegisterPage() {
  usePageTitle('Register');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await apiRegister({
        name: fullName,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      saveAuth(res.access_token);
      toast.success('Registration successful');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Register failed:', error);
      const detail = error?.detail;
      const message = detail?.message || Object.values(detail?.errors || {})?.[0]?.[0] || 'Registration failed';
      setError(String(message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-12" direction="column" justify="center" align="center">
        <Box className="flex-grow"></Box>
        
        <Box className="text-center" mb="6">
          <Flex direction="column" align="center" gap="4">
            <BrandLogo size={24} showText={true} />
            <Heading size="5">Create your account</Heading>
          </Flex>
        </Box>

        <Container size="2" className="max-w-md w-full mx-auto">
          <Card size="3">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Text size="2" color="red">{error}</Text>
              )}

              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">Full Name</Text>
                <TextField.Root 
                  type="text"
                  placeholder="John Doe" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full"
                >
                  <TextField.Slot>
                    <User size={16} />
                  </TextField.Slot>
                </TextField.Root>
              </Flex>

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
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-0 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </TextField.Slot>
                </TextField.Root>
              </Flex>

              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">Confirm Password</Text>
                <TextField.Root
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-0 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </Box>
            </form>
          </Card>
          <Box className="text-center mt-4">
            <Text size="2">Already have an account? </Text>
            <Link href="/auth/login" size="2">Sign in</Link>
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
