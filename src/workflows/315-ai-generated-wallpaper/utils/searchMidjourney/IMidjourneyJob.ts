export interface IMidjourneyJob {
    current_status: string;
    enqueue_time: string;
    event: {
        height: number;
        textPrompt: string[];
        imagePrompts?: any;
        width: number;
        batchSize: number;
        seedImageURL: string;
    };
    flagged: boolean;
    followed_by_user: boolean;
    full_command: string;
    grid_cells: number;
    grid_id?: any;
    grid_num?: any;
    guild_id?: any;
    hidden: boolean;
    id: string;
    image_paths: string[];
    is_published: boolean;
    like_count: number;
    liked_by_user: boolean;
    liked_timestamp?: any;
    low_priority: boolean;
    mod_hidden: boolean;
    platform: string;
    platform_channel?: any;
    platform_channel_id?: any;
    platform_message_id?: any;
    platform_thread_id?: any;
    prompt: string;
    ranked_by_user: boolean;
    ranked_timestamp?: any;
    ranking_by_user?: any;
    reference_image_num: string;
    reference_job_id: string;
    type: string;
    user_id: string;
    user_ranking_count: number;
    user_ranking_score: number;
    username: string;
}