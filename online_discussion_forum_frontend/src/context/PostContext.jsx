import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const Context = React.createContext();

export function usePost() {
    return useContext(Context)
}

export function PostProvider({ children }) {
    const [post, setPost] = useState(null);

    const [loading, setLoading] = useState(true); // Set loading to true initially
    const [error, setError] = useState(null);
    const { forumId, threadId } = useParams();
    const axiosPrivate = useAxiosPrivate();

    console.log(post)

    const commentsByParentId = useMemo(() => {
    
        if (!post || !post.thread || !post.thread.comments) {
            return {};
        }
        
        const group = {};
        post.thread.comments.forEach(comment => {
            group[comment.parentId] ||= [] // Ensure the array exists
            group[comment.parentId].push(comment);
        });

        console.log('group', group)

        return group;
    }, [post?.thread?.comments]);
    
    console.log('commentsBy', commentsByParentId);

    function getReplies(parentId) {
        return commentsByParentId[parentId]
    }

    

    useEffect(() => {
        const fetchSinglePost = async () => {
            try {
                const response = await axiosPrivate.get(`/forums/${forumId}/threads/${threadId}`);
                setPost(response.data);
                setLoading(false); // Set loading to false when data is loaded
            } catch (error) {
                setError(error);
                setLoading(false); // Set loading to false even in case of error
            }
        };

        if (threadId) {
            fetchSinglePost();
        }
    }, [axiosPrivate, forumId, threadId]);

    // Render children only when data is loaded
    return (
        <Context.Provider value={{
             post,
             rootComments: commentsByParentId[null],
             getReplies
             }}>
            {loading ? (
                <h1>Loading</h1>
            ) : error ? (
                <h1>{error}</h1>
            ) : (
                children
            )}
        </Context.Provider>
    );
}
