import { Comment } from "./commentsForPage"
import { Box, Typography } from '@mui/material';

export function CommentList({ comments }) {
    const NoCommentsMessage = () => (
      <Box paddingTop={15} paddingBottom={15} paddingLeft={30}>
        <Typography variant="h6" color="textSecondary">
          Oops! No comments yet.
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Be the first one to share your thoughts.
        </Typography>
      </Box>
    );
    
    // Inside your component or function
    if (!comments || comments.length === 0) {
      return <NoCommentsMessage />;
    }

    console.log(comments)

    return (
      <>
        {comments.map(comment => (
          <div key={comment._id} className="comment-stack">
            <Comment {...comment} />
          </div>
        ))}
      </>
    );
  }