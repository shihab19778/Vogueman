import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Product } from '../types';

interface ReviewFormProps {
  product: Product;
  onSuccess?: () => void;
}

export function ReviewForm({ product, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      // Add review
      await addDoc(collection(db, 'reviews'), {
        productId: product.id,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      // Update product rating
      const productRef = doc(db, 'products', product.id);
      const currentRating = product.averageRating || 0;
      const currentCount = product.reviewCount || 0;
      const newCount = currentCount + 1;
      const newAverage = ((currentRating * currentCount) + rating) / newCount;

      await updateDoc(productRef, {
        averageRating: Number(newAverage.toFixed(1)),
        reviewCount: increment(1)
      });

      toast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      if (onSuccess) onSuccess();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
      <h3 className="text-lg font-medium">Leave a Review</h3>
      
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className={`w-6 h-6 ${
                (hover || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300'
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts about this product..."
        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none min-h-[100px] resize-none text-sm"
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {submitting ? 'Submitting...' : 'Post Review'}
      </button>
    </form>
  );
}
