import { Injectable } from '@angular/core';
import { HttpInternalService } from './http-internal.service';
import { Post } from '../models/post/post';
import { NewReaction } from '../models/reactions/newReaction';
import { NewPost } from '../models/post/new-post';
import { NewDisreaction } from '../models/disreactions/newDisReaction';

@Injectable({ providedIn: 'root' })
export class PostService {
    public routePrefix = '/api/posts';

    constructor(private httpService: HttpInternalService) { }

    public getPosts() {
        return this.httpService.getFullRequest<Post[]>(`${this.routePrefix}`);
    }

    public createPost(post: NewPost) {
        return this.httpService.postFullRequest<Post>(`${this.routePrefix}`, post);
    }

    public editPost(post: Post) {
        return this.httpService.postFullRequest<Post>(`${this.routePrefix}/edit`, post)
    }

    public deletePost(postId: number) {
        return this.httpService.deleteFullRequest<number>(`${this.routePrefix}/delete/${postId}` )
    }


    public likePost(reaction: NewReaction) {
        return this.httpService.postFullRequest<Post>(`${this.routePrefix}/like`, reaction);
    }

    public disPost(disreaction: NewDisreaction) {
        return this.httpService.postFullRequest<Post>(`${this.routePrefix}/dis`, disreaction);
    }


}
