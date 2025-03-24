import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Order } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  User,
  Package,
  Heart,
  CreditCard,
  LogOut,
  Settings,
  Eye,
  EyeOff,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Profile information form schema
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

// Change password form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 mr-1" />;
    case "processing":
      return <Clock className="h-4 w-4 mr-1" />;
    case "pending":
      return <AlertTriangle className="h-4 w-4 mr-1" />;
    case "cancelled":
      return <XCircle className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
};

const ProfilePage = () => {
  const { user, logoutMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  // Fetch user orders
  const { data: orders, isLoading: isOrdersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  // Profile form setup
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      username: user?.username || "",
    },
  });

  // Password form setup
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle profile update
  const onProfileSubmit = (values: ProfileFormValues) => {
    setIsProfileUpdating(true);
    
    // Simulate API call to update profile
    setTimeout(() => {
      console.log("Profile updated:", values);
      setIsProfileUpdating(false);
    }, 1000);
  };

  // Handle password update
  const onPasswordSubmit = (values: PasswordFormValues) => {
    setIsPasswordUpdating(true);
    
    // Simulate API call to update password
    setTimeout(() => {
      console.log("Password updated:", values);
      setIsPasswordUpdating(false);
      passwordForm.reset();
    }, 1000);
  };

  // Get initials for avatar
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0].toUpperCase() || "U";
  };

  if (!user) {
    return null; // Should be handled by ProtectedRoute
  }

  return (
    <>
      <Helmet>
        <title>My Account | CyclePro</title>
      </Helmet>

      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Sidebar */}
              <div className="md:w-1/4">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.pictureUrl} alt={user.firstName || user.username} />
                        <AvatarFallback className="bg-[#3D5A80] text-white text-lg">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">
                          {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username}
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <nav className="space-y-1">
                      <Link href="/profile">
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                      <Link href="/profile/orders">
                        <Button variant="ghost" className="w-full justify-start">
                          <Package className="mr-2 h-4 w-4" />
                          Orders
                        </Button>
                      </Link>
                      <Link href="/profile/wishlist">
                        <Button variant="ghost" className="w-full justify-start">
                          <Heart className="mr-2 h-4 w-4" />
                          Wishlist
                        </Button>
                      </Link>
                      <Link href="/profile/payment">
                        <Button variant="ghost" className="w-full justify-start">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Payment Methods
                        </Button>
                      </Link>
                      {user.isAdmin && (
                        <Link href="/admin">
                          <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                      >
                        {logoutMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="mr-2 h-4 w-4" />
                        )}
                        Log Out
                      </Button>
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="md:w-3/4">
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>

                  {/* Profile Tab */}
                  <TabsContent value="profile">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                          Update your account details and profile information.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...profileForm}>
                          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={profileForm.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={profileForm.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={profileForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end">
                              <Button
                                type="submit"
                                className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90"
                                disabled={isProfileUpdating}
                              >
                                {isProfileUpdating ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  "Update Profile"
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Orders Tab */}
                  <TabsContent value="orders">
                    <Card>
                      <CardHeader>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>
                          View and track your recent orders.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isOrdersLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-[#3D5A80]" />
                          </div>
                        ) : orders && orders.length > 0 ? (
                          <div className="space-y-4">
                            {orders.map((order) => (
                              <div key={order.id} className="border rounded-md p-4">
                                <div className="flex flex-col md:flex-row justify-between mb-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium">Order #{order.id}</h3>
                                      <Badge variant="outline" className={getStatusColor(order.status)}>
                                        <span className="flex items-center">
                                          {getStatusIcon(order.status)}
                                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="mt-2 md:mt-0">
                                    <div className="text-right">
                                      <span className="font-medium">{formatCurrency(order.total)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <Link href={`/order-confirmation/${order.id}`}>
                                    <Button variant="outline" size="sm" className="text-[#3D5A80] font-medium">
                                      View Details
                                      <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Alert>
                            <AlertTitle>No orders found</AlertTitle>
                            <AlertDescription>
                              You haven't placed any orders yet. Start shopping to see your orders here.
                            </AlertDescription>
                            <div className="mt-4">
                              <Button asChild className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90">
                                <Link href="/shop">Shop Now</Link>
                              </Button>
                            </div>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Security Tab */}
                  <TabsContent value="security">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>
                          Update your password and manage security settings.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...passwordForm}>
                          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <FormField
                              control={passwordForm.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Password</FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Input
                                        type={showPassword ? "text" : "password"}
                                        {...field}
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-0 top-0 h-10 w-10"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>New Password</FormLabel>
                                  <FormControl>
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm New Password</FormLabel>
                                  <FormControl>
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end">
                              <Button
                                type="submit"
                                className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90"
                                disabled={isPasswordUpdating}
                              >
                                {isPasswordUpdating ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  "Change Password"
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>

                        {/* Connected Accounts */}
                        <div className="mt-8">
                          <h3 className="text-lg font-medium mb-4">Connected Accounts</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border p-4 rounded-md">
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  width="24"
                                  height="24"
                                  className="mr-3"
                                >
                                  <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                  />
                                  <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                  />
                                  <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                  />
                                  <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                  />
                                </svg>
                                <div>
                                  <h4 className="font-medium">Google</h4>
                                  <p className="text-sm text-gray-500">
                                    {user.googleId ? "Connected" : "Not connected"}
                                  </p>
                                </div>
                              </div>
                              {user.googleId ? (
                                <Button variant="outline" size="sm">
                                  Disconnect
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[#3D5A80] border-[#3D5A80]"
                                  asChild
                                >
                                  <a href="/api/auth/google">Connect</a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
