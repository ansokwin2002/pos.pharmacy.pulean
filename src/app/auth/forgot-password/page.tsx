'use client';

import { useState } from 'react';
import { Box, Container, Flex, Heading, Text, Button, Card, TextField } from '@radix-ui/themes';
import { ArrowLeft, Mail } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useRouter } from 'next/navigation';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function ForgotPasswordPage() {
  usePageTitle('Forgot Password');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate password reset request
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset request failed:', error);
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
            <Heading size="5">Reset your password</Heading>
          </Flex>
        </Box>

        <Container size="2" className="max-w-md w-full mx-auto">
          {!isSubmitted ? (
            <>
              <Button 
                variant="ghost"
                onClick={() => router.push('/auth/login')}
                mb="4"
              >
                <ArrowLeft size={18} />
                Back to login
              </Button>
              <Card size="3">
                <Box className="mb-4">
                  <Text size="2">Enter your email and we&apos;ll send you instructions to reset your password</Text>
                </Box>
                
                <form onSubmit={handleSubmit} className="space-y-5">
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

                  <Box>
                    <Button 
                      type="submit" 
                      className="!w-full" 
                      disabled={isLoading}
                      size="3"
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                    </Button>
                  </Box>
                </form>
              </Card>
            </>
          ) : (
            <Card size="3" className="text-center p-4">
              <Heading size="5" className="mb-4">Check your email</Heading>
              <Text as="p" size="2" mb="6">
                We&apos;ve sent password reset instructions to <strong>{email}</strong>. 
                Please check your inbox and follow the link provided.
              </Text>
              <Button 
                onClick={() => router.push('/auth/login')}
                size="3"
                className="!w-full"
              >
                Return to Sign In
              </Button>
            </Card>
          )}
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