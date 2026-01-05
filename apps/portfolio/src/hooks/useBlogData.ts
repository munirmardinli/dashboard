import { useState, useEffect } from "react";
import { getData } from "./get";

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData<{ posts: BlogPost[] }>("blog")
      .then((data) => {
        setPosts(data?.posts || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fehler beim Laden der Blog-Daten:", error);
        setPosts([]);
        setLoading(false);
      });
  }, []);

  return { posts, loading };
};

export const useBlogPost = (id: string) => {
  const [post, setPost] = useState<BlogPost | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData<{ posts: BlogPost[] }>("blog")
      .then((data) => {
        const foundPost = data.posts.find((p) => p.id === id);
        setPost(foundPost);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  return { post, loading };
};
