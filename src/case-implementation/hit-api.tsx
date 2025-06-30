import { useEffect, useState } from 'react';
import VirtualTable, { type IColumn } from '../components/virtual-table';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export default function HitApi() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/posts');
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (expandedPostId && !commentsMap[expandedPostId] && !loadingComments[expandedPostId]) {
      const fetchComments = async () => {
        setLoadingComments((prev) => ({ ...prev, [expandedPostId]: true }));
        try {
          const res = await fetch(
            `https://jsonplaceholder.typicode.com/posts/${expandedPostId}/comments`,
          );
          if (!res.ok) throw new Error('Failed to fetch comments');
          const data = await res.json();
          setCommentsMap((prev) => ({ ...prev, [expandedPostId]: data }));
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingComments((prev) => ({ ...prev, [expandedPostId]: false }));
        }
      };

      fetchComments();
    }
  }, [expandedPostId, commentsMap, loadingComments]);

  const columns: IColumn<Post>[] = [
    { key: 'expand', header: '', width: 32 },
    { key: 'id', header: 'ID', render: (post: Post) => <span>{post.id}</span> },
    { key: 'title', header: 'Title' },
    { key: 'body', header: 'Body', width: 500 },
  ];

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className='h-dvh w-full mx-auto'>
        <div className='p-2 h-[600px]'>
          <VirtualTable
            headerHeight={36}
            columns={columns}
            data={posts}
            getRowKey={(post) => post.id}
            onRowExpand={(post) => setExpandedPostId(post.id)}
            renderExpandedRow={(post) => {
              const comments = commentsMap[post.id];
              const isLoading = loadingComments[post.id];

              return (
                <div className='space-y-3 h-full'>
                  {isLoading ? (
                    <div className='flex items-center py-4'>
                      <span className='text-muted-foreground'>Loading comments...</span>
                    </div>
                  ) : (
                    <ExpandedElement comments={comments} />
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* <TipeContent /> */}
      </div>
    </>
  );
}

const ExpandedElement = ({ comments }: { comments: Comment[] }) => {
  const columns: IColumn<Comment>[] = [
    { key: 'id', header: 'ID', width: 160 },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email', width: 300 },
  ];

  return (
    <div className='pl-[1.95rem] h-full'>
      <VirtualTable
        hideHeader
        classNameOuterTable='!border-l !border-b-transparent !border-t-transparent !border-r-transparent'
        columns={columns}
        data={comments}
        getRowKey={(post) => post.id}
      />
    </div>
  );
};
