import { Injectable } from '@angular/core';
import { AuthenticationService } from './auth.service';
import { Post } from '../models/post/post';
import { Comment } from '../models/comment/comment';
import { NewReaction } from '../models/reactions/newReaction';
import { PostService } from './post.service';
import { User } from '../models/user';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommentService } from './comment.service';


@Injectable({ providedIn: 'root' })
export class LikeService {
    public constructor(private authService: AuthenticationService, private postService: PostService, private commentService: CommentService) { }

    public like(PostOrComment: Post | Comment, currentUser: User) {


        const innerPoOrCo = PostOrComment;



        const reaction: NewReaction = {
            entityId: innerPoOrCo.id,
            isLike: true,
            userId: currentUser.id
        };

        // update current array instantly

        let hasDisreaction = innerPoOrCo.disreactions.some((x) => x.user.id === currentUser.id);
        if (hasDisreaction) {
            innerPoOrCo.disreactions = innerPoOrCo.disreactions.filter((x) => x.user.id !== currentUser.id)
        }

        hasDisreaction = innerPoOrCo.disreactions.some((x) => x.user.id === currentUser.id);



        let hasReaction = innerPoOrCo.reactions.some((x) => x.user.id === currentUser.id);
        innerPoOrCo.reactions = hasReaction
            ? innerPoOrCo.reactions.filter((x) => x.user.id !== currentUser.id)
            : innerPoOrCo.reactions.concat({ isLike: true, user: currentUser });
        hasReaction = innerPoOrCo.reactions.some((x) => x.user.id === currentUser.id);


        if (innerPoOrCo.hasOwnProperty('previewImage')) {
            return this.postService.likePost(reaction).pipe(
                map(() => innerPoOrCo),
                catchError(() => {
                    // revert current array changes in case of any error
                    innerPoOrCo.reactions = hasReaction
                        ? innerPoOrCo.reactions.filter((x) => x.user.id !== currentUser.id)
                        : innerPoOrCo.reactions.concat({ isLike: true, user: currentUser });

                    return of(innerPoOrCo);
                })
            );
        } else {
            return this.commentService.likeComment(reaction).pipe(
                map(() => innerPoOrCo),
                catchError(() => {
                    // revert current array changes in case of any error
                    innerPoOrCo.reactions = hasReaction
                        ? innerPoOrCo.reactions.filter((x) => x.user.id !== currentUser.id)
                        : innerPoOrCo.reactions.concat({ isLike: true, user: currentUser });

                    return of(innerPoOrCo);
                })
            );
        }



    }



}
