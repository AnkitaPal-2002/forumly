"use client";

import axios from 'axios';
import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';

import { ExtendedPost } from '@/types/post';
import { INFINITE_SCROLL_PAGINATION_NUMBER } from '@/config';

import Post from './Post';

interface UserFeedProps {
    initialPosts: ExtendedPost[];
    username: string;
    tabName: string;
}

const UserFeed = ({
    initialPosts,
    username,
    tabName,
}: UserFeedProps) => {
    const { data: session } = useSession();

    const containerRef = useRef<HTMLElement>(null);
    const { ref, entry } = useIntersection({
        root: containerRef.current,
        threshold: 1,
    });

    const {
        data,
        isFetchingNextPage,
        fetchNextPage,
        isPending,
    } = useInfiniteQuery({
        queryKey: ['posts'],
        queryFn: async ({ pageParam }) => {
            const query = `/api/user/post?limit=${INFINITE_SCROLL_PAGINATION_NUMBER}&page=${pageParam}&username=${username}&tabName=${tabName}`;
            const res = await axios.get(query);
            return res.data as ExtendedPost[];
        },
        initialPageParam: 1,
        getNextPageParam: (_, Page) => {
            return Page.length + 1;
        },
        initialData: {
            pages: [initialPosts],
            pageParams: [1],
        },
    });

    useEffect(() => {
        if (entry?.isIntersecting) {
            fetchNextPage();
        }
    }, [entry, fetchNextPage]);

    const posts = data.pages.flatMap((page) => page) ?? initialPosts;

    return (
        <ul className="flex flex-col col-span-2 space-y-6">
            {isPending && (
                <div className="flex justify-center items-center py-6">
                    <div className="flex space-x-4">
                        <div className="w-6 h-6 rounded-full border-4 border-t-zinc-500 border-b-zinc-300 animate-spin"></div>
                        <span className="text-zinc-500">Loading...</span>
                    </div>
                </div>
            )}

            {posts.map((post, index) => {
                const votesAmount = post.votes.reduce((accumulator, vote) => {
                    if (vote.type === 'UP') return accumulator + 1;
                    if (vote.type === 'DOWN') return accumulator - 1;
                    return accumulator;
                }, 0);

                const currentVote = post.votes.find(
                    (vote) => vote.userId === session?.user.id
                );

                const savedPost = (post.SavedPost ?? []).find(
                    (savedPost) => savedPost.userId === session?.user.id
                );

                const isSaved = savedPost !== undefined;

                if (index === posts.length - 1) {
                    return (
                        <li key={post.id} ref={ref}>
                            <Post
                                post={post}
                                commentAmt={post.comments.length}
                                subforumName={post.subForum.name}
                                votesAmount={votesAmount}
                                currentVote={currentVote}
                                currentUserId={session?.user?.id}
                                initialSavedState={isSaved} // Pass the saved status to the Post component
                            />
                        </li>
                    );
                } else {
                    return (
                        <Post
                            key={post.id}
                            post={post}
                            commentAmt={post.comments.length}
                            subforumName={post.subForum.name}
                            votesAmount={votesAmount}
                            currentVote={currentVote}
                            currentUserId={session?.user?.id}
                            initialSavedState={isSaved}
                        />
                    );
                }
            })}

            {isFetchingNextPage && (
                <li className="flex justify-center">
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                </li>
            )}
        </ul>
    );
};

export default UserFeed;
