import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Trash2, XCircle } from "lucide-react";
import {
  fetchCart,
  removeFromCart,
  clearCart,
  redeemCart,
} from "@/lib/authClient";
import type { Cart, CartItem as CartItemType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

// CartItem component
const CartItem = ({
  item,
  onRemove,
}: {
  item: CartItemType;
  onRemove: (id: number) => void;
}) => (
  <div className="flex items-center gap-4 py-3">
    <img
      src={item.product.thumbnail || "/placeholder.svg"}
      alt={item.product.name}
      className="w-16 h-16 rounded-md object-cover"
    />
    <div className="flex-1">
      <h4 className="font-semibold">{item.product.name}</h4>
      <p className="text-sm text-muted-foreground">
        {item.product.points_price} x {item.quantity}
      </p>
      <p className="font-bold text-primary">{item.total_points} EduCoins</p>
    </div>
    <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)}>
      <XCircle className="w-5 h-5 text-muted-foreground" />
    </Button>
  </div>
);

// Main Cart Page
const CartPage = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchUser } = useAuth(); // To refresh user balance after purchase

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await fetchCart();
      setCart(cartData);
    } catch (error) {
      toast.error("Failed to fetch cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      const updatedCart = await removeFromCart(cartItemId);
      setCart(updatedCart);
      toast.success("Item removed from cart.");
    } catch (error) {
      toast.error("Failed to remove item.");
    }
  };

  const handleClearCart = async () => {
    try {
      const updatedCart = await clearCart();
      setCart(updatedCart);
      toast.success("Cart cleared.");
    } catch (error) {
      toast.error("Failed to clear cart.");
    }
  };

  const handleRedeem = async () => {
    try {
      await redeemCart();
      toast.success("Purchase successful! Your items are redeemed. 🎉");
      await loadCart(); // Refresh cart (should be empty)
      await fetchUser(); // Refresh user's coin balance in the app
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "An unexpected error occurred.";
      toast.error(`Purchase failed: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center h-screen pt-20">
        <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild>
          <Link to="/marketplace">Browse Marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            Order Summary ({cart.items.length}{" "}
            {cart.items.length === 1 ? "item" : "items"})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} onRemove={handleRemoveItem} />
          ))}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="w-full flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{cart.total_cart_points} EduCoins</span>
          </div>
          <Button
            className="w-full"
            onClick={handleRedeem}
            disabled={cart.items.length === 0}
          >
            Redeem Now
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={handleClearCart}
            disabled={cart.items.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CartPage;
