import { Injectable } from '@angular/core';
import { HttpInternalService } from './http-internal.service';
import { NewComment } from '../models/comment/new-comment';
import { Comment } from '../models/comment/comment';
import { NewDisreaction } from '../models/disreactions/newDisreaction';
import { NewReaction } from '../models/reactions/newReaction';

@Injectable({ providedIn: 'root' })
export class CommentService {
    public routePrefix = '/api/comments';

    constructor(private httpService: HttpInternalService) { }

    public createComment(post: NewComment) {
        return this.httpService.postFullRequest<Comment>(`${this.routePrefix}`, post);
    }

    public editComment(post: Comment) {
        return this.httpService.postFullRequest<Comment>(`${this.routePrefix}/edit`, post);
    }

    public deletePost(commentId: number) {
        return this.httpService.deleteFullRequest<number>(`${this.routePrefix}/delete/${commentId}`)
    }

    public disComment(disreaction: NewDisreaction) {
        return this.httpService.postFullRequest<Comment>(`${this.routePrefix}/dis`, disreaction);
    }

    public likeComment(disreaction: NewReaction) {
        return this.httpService.postFullRequest<Comment>(`${this.routePrefix}/like`, disreaction);
    }


}
