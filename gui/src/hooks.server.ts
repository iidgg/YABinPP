import { deleteExpired } from '$lib/server/services';
import cron from 'node-cron';

export async function handle({ event, resolve }) {
    const searchParams = event.url.searchParams;
    if (searchParams.get('r') !== null || searchParams.get('raw') !== null) {
        event.request.headers.set('Accept', 'text/plain');
    }

    return await resolve(event);
}

// Cron-job to delete expired pastes
cron.schedule('* * * * *', async () => {
    await deleteExpired();
});
