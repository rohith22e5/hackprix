import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, Trophy, Star, Settings, X, Pencil, LogOut, User as UserIcon, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchWalletInfo } from "@/lib/authClient";
import { uploadToCloudinary } from "@/lib/cloudinary";

type WalletInfo = {
  address: string | null;
  balance: number;
  symbol: string;
};

const Profile = () => {
  const { user, fetchUser, updateUserProfile, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [editFormData, setEditFormData] = useState({
    username: "",
    bio: "",
    mobile_number: "",
    wallet_address: "",
    private_key: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (!user) {
        await fetchUser();
      }
      const walletData = await fetchWalletInfo();
      setWalletInfo(walletData);
      setLoading(false);
    };
    loadData();
  }, [fetchUser, user]);

  useEffect(() => {
    if (user) {
      setEditFormData({
        username: user.username || "",
        bio: user.bio || "",
        mobile_number: user.mobile_number || "",
        wallet_address: user.wallet_address || "",
        private_key: (user as any).private_key || "",
      });
    }
  }, [user]);
  
  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    console.log("[PROFILE] File selected:", file.name, file.type, file.size);
    try {
      console.log("[PROFILE] Starting Cloudinary upload...");
      const imageUrl = await uploadToCloudinary(file);
      console.log("[PROFILE] Cloudinary upload success. URL:", imageUrl);
      console.log("[PROFILE] Calling updateUserProfile...");
      await updateUserProfile({ profile_image: imageUrl });
      console.log("[PROFILE] Profile updated successfully");
    } catch (error) {
      console.error("[PROFILE] Upload failed:", error);
      alert(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleEditProfile = () => {
    setSettingsOpen(false);
    setEditModalOpen(true);
  };

  const handleLogout = () => {
    setSettingsOpen(false);
    logout();
  };
  
  const handleModalFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleModalFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile(editFormData);
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Could not load user profile.</p>
      </div>
    );
  }

  const userLevel = Math.floor((user.xp || 0) / 1000);
  const nextLevelXP = (userLevel + 1) * 1000;
  const xpProgress = user.xp ? ((user.xp % 1000) / 10) : 0;

  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Profile</h1>
          <p className="text-muted-foreground">Track your learning journey</p>
        </div>
        <div className="relative" ref={settingsRef}>
          <Button size="icon" variant="outline" className="rounded-xl" onClick={() => setSettingsOpen(prev => !prev)}>
            <Settings className="w-5 h-5" />
          </Button>
          {isSettingsOpen && (
            <Card className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border z-10">
              <Button variant="ghost" className="w-full justify-start" onClick={handleEditProfile}>
                <UserIcon className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Card className="p-6 mb-6 shadow-float gradient-cyber">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="relative w-20 h-20 group"
            onMouseEnter={() => setIsHoveringAvatar(true)}
            onMouseLeave={() => setIsHoveringAvatar(false)}
          >
            <img
              src={user.profile_image || "/placeholder.svg"}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
            {isHoveringAvatar && (
              <div
                className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center cursor-pointer"
                onClick={handleEditAvatarClick}
              >
                <Pencil className="w-5 h-5 text-white" />
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary-foreground">{user.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-primary-foreground font-semibold">Level {userLevel}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-primary-foreground/80">
            <span>XP Progress</span>
            <span>
              {user.xp || 0} / {nextLevelXP}
            </span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 shadow-card gradient-card border-accent/20">
          <Trophy className="w-8 h-8 text-accent mb-2" />
          <p className="text-2xl font-bold">{user.xp || 0}</p>
          <p className="text-sm text-muted-foreground">Total XP</p>
        </Card>
        <Card className="p-4 shadow-card gradient-card border-secondary/20">
          <Award className="w-8 h-8 text-secondary mb-2" />
          <p className="text-2xl font-bold">{walletInfo && walletInfo.address ?walletInfo.balance : 0}</p>
          <p className="text-sm text-muted-foreground">EduCoins</p>
        </Card>
      </div>

       {/* Wallet Information */}
       <div className="mb-6">
        <h3 className="text-lg font-bold mb-3">Wallet Information</h3>
        <Card className="p-4 shadow-card gradient-card">
          {walletInfo && walletInfo.address ? (
            <div className="space-y-2 text-sm">
               <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground flex items-center"><Wallet className="w-4 h-4 mr-2"/>Balance:</span>
                <span className="text-foreground font-mono text-lg">{walletInfo.balance} {walletInfo.symbol}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-muted-foreground">Address:</span>
                <span className="text-foreground text-xs mt-1 break-all">{walletInfo.address}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-muted/20">
                <span className="font-semibold text-muted-foreground">Private Key status:</span>
                <span className={(user as any).private_key ? "text-green-500 font-bold text-xs" : "text-amber-500 font-bold text-xs"}>
                  {(user as any).private_key ? "CONFIGURED (SECURE)" : "NOT CONFIGURED"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center">No wallet address linked.</p>
          )}
        </Card>
      </div>

      {/* Basic Information */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3">Basic Information</h3>
        <Card className="p-4 shadow-card gradient-card">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground">Role:</span>
              <span className="text-foreground capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground">Email:</span>
              <span className="text-foreground">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground">Mobile:</span>
              <span className="text-foreground">{user.mobile_number || "Not provided"}</span>
            </div>
             <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground">Institution:</span>
              <span className="text-foreground">{user.institution_name || "Not provided"}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bio Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3">About Me</h3>
        <Card className="p-4 shadow-card gradient-card">
          <p className="text-foreground text-sm">{user.bio || "No bio provided."}</p>
        </Card>
      </div>
      
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg m-4 p-6 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setEditModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <h3 className="text-lg font-bold mb-4">Edit Profile</h3>
            <form onSubmit={handleModalFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username}
                  onChange={handleModalFormChange}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
               <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  name="mobile_number"
                  value={editFormData.mobile_number}
                  onChange={handleModalFormChange}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={editFormData.bio}
                  onChange={handleModalFormChange}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                  rows={4}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
                <input
                  type="text"
                  name="wallet_address"
                  value={editFormData.wallet_address}
                  onChange={handleModalFormChange}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                  placeholder="0x..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Private Key</label>
                <input
                  type="password"
                  name="private_key"
                  value={editFormData.private_key}
                  onChange={handleModalFormChange}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                  placeholder="0x..."
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;
