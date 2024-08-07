'use client'

import MessageCard from '@/components/MessageCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Message } from '@/model/User'
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { Loader2, RefreshCcw } from 'lucide-react'
import { User } from 'next-auth';
import { useSession } from 'next-auth/react'
import React, {useCallback, useEffect, useState, Key} from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast';

const Dashboard = () => {

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)

  // const { toast } = useToast();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId))
  }

  const { data: session } = useSession()

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })

  const { register, watch, setValue } = form;

  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>(`/api/accept-messages`)
      setValue('acceptMessages', response.data.isAcceptingMessage)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      // toast('Error', axiosError.response?.data.message || "Failed to fetch message setting", {
      //   variant: 'destructive',
      // });
      toast.error(axiosError.response?.data.message || "Failed to fetch message setting")
    }
    finally {
      setIsSwitchLoading(false)
    }
  }, [setValue, toast])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>(`/api/get-messages`)
      setMessages(response.data.message as unknown as Message[] || [])
      if (refresh) {
        // toast('Refreshed Messages', 'Showing lastest messages', {
        //   variant: 'default',
        // })
        toast('Showing lastest messages')
      }
    }
    catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      // toast('', axiosError.response?.data.message || "Failed to fetch messages", {
      //   variant: 'destructive',
      // });
      toast.error(axiosError.response?.data.message || "Failed to fetch messages")
    }
    finally {
      setIsLoading(false)
      setIsSwitchLoading(false)
    }
  }, [setIsLoading, setMessages, toast])

  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages()
    fetchAcceptMessages()
  }, [session, setValue, fetchAcceptMessages, fetchMessages])

  const handleSwitchChange = async () => {
    // setIsSwitchLoading(true)
    try {
      const response = await axios.post<ApiResponse>(`/api/accept-messages`, {
        acceptMessages: !acceptMessages,
      })
      setValue('acceptMessages', !acceptMessages)
      // toast('Success', 'Message setting updated', {
      //   variant: 'default',
      // })
      toast('Message setting updated')
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      // toast('Error', axiosError.response?.data.message || "Failed to update message setting", {
      //   variant: 'destructive',
      // });
      toast.error(axiosError.response?.data.message || "Failed to update message setting")
    }
    // finally {
    //   setIsSwitchLoading(false)
    // }
  }

  if (!session || !session.user) {
    return (
      <div></div>
    )
  }
  
  const { username } = session?.user as User;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);

    // toast('URL Copied!', 'Profile URL has been copied to clipboard.', {
    //   variant: 'default',
    // })
    toast('URL copied to clipboard.')
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id as Key}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard