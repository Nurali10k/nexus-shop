import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchProductReviews, submitProductReview, voteOnProductReview } from '../../services/reviews';

export const loadProductReviews = createAsyncThunk('reviews/load', async (productId) => ({
  productId: String(productId), reviews: await fetchProductReviews(productId),
}));
export const saveProductReview = createAsyncThunk('reviews/save', async (review) => {
  await submitProductReview(review);
  return { productId: String(review.productId) };
});
export const voteReview = createAsyncThunk('reviews/vote', async ({ productId, reviewId, value }) => ({
  productId: String(productId), reviewId, ...(await voteOnProductReview({ reviewId, value })),
}));

const initialState = { byProduct: {}, loading: {}, saving: false, error: null, voting: {} };
const reviewsSlice = createSlice({
  name: 'reviews', initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(loadProductReviews.pending, (state, action) => { state.loading[action.meta.arg] = true; state.error = null; })
      .addCase(loadProductReviews.fulfilled, (state, action) => {
        state.loading[action.payload.productId] = false;
        state.byProduct[action.payload.productId] = action.payload.reviews;
      })
      .addCase(loadProductReviews.rejected, (state, action) => {
        state.loading[action.meta.arg] = false;
        state.error = action.error.message;
      })
      .addCase(saveProductReview.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(saveProductReview.fulfilled, (state) => { state.saving = false; })
      .addCase(saveProductReview.rejected, (state, action) => { state.saving = false; state.error = action.error.message; })
      .addCase(voteReview.pending, (state, action) => { state.voting[action.meta.arg.reviewId] = true; })
      .addCase(voteReview.fulfilled, (state, action) => {
        state.voting[action.payload.reviewId] = false;
        const review = state.byProduct[action.payload.productId]?.find((item) => item.id === action.payload.reviewId);
        if (review) review.helpfulVotes = action.payload.helpfulVotes;
      })
      .addCase(voteReview.rejected, (state, action) => {
        state.voting[action.meta.arg.reviewId] = false;
        state.error = action.error.message;
      });
  },
});
export default reviewsSlice.reducer;
