import useAxiosPrivate from "../hooks/useAxiosPrivate"

const axiosPrivate = useAxiosPrivate();

export function getThreads(forumId) {
    const a = axiosPrivate.get(`/forums/${forumId}/threads`)
    console.log('a a',a)
    return a
}