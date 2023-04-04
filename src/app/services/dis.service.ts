import { Injectable } from '@angular/core';
import { AuthenticationService } from './auth.service';
import { Post } from '../models/post/post';
import { Comment } from '../models/comment/comment'
import { PostService } from './post.service';
import { User } from '../models/user';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NewDisreaction } from '../models/disreactions/newDisReaction';

import { CommentService } from './comment.service';

@Injectable({ providedIn: 'root' })


export class DisService {
    public constructor(private authService: AuthenticationService, private postService: PostService, private commentService: CommentService) { }


    public dis(PostOrComment: Post | Comment, currentUser: User) {
        const innerPoOrCo = PostOrComment;

        const disreaction: NewDisreaction = {
            entityId: innerPoOrCo.id,
            isDis: true,
            userId: currentUser.id
        };

        // update current array instantly
        let hasReaction = innerPoOrCo.reactions.some((x) => x.user.id === currentUser.id);
        if (hasReaction) {
            innerPoOrCo.reactions = innerPoOrCo.reactions.filter((x) => x.user.id !== currentUser.id)
        }

        hasReaction = innerPoOrCo.reactions.some((x) => x.user.id === currentUser.id);



        let hasDisreaction = innerPoOrCo.disreactions.some((x) => x.user.id === currentUser.id);
        innerPoOrCo.disreactions = hasDisreaction
            ? innerPoOrCo.disreactions.filter((x) => x.user.id !== currentUser.id)
            : innerPoOrCo.disreactions.concat({ isDis: true, user: currentUser });
        hasDisreaction = innerPoOrCo.disreactions.some((x) => x.user.id === currentUser.id);


        if (innerPoOrCo.hasOwnProperty('previewImage')) {
            return this.postService.disPost(disreaction).pipe(
                map(() => innerPoOrCo),
                catchError(() => {
                    // revert current array changes in case of any error
                    innerPoOrCo.disreactions = hasDisreaction
                        ? innerPoOrCo.disreactions.filter((x) => x.user.id !== currentUser.id)
                        : innerPoOrCo.disreactions.concat({ isDis: true, user: currentUser });

                    return of(innerPoOrCo);
                })
            );
        } else {
            return this.commentService.disComment(disreaction).pipe(
                map(() => innerPoOrCo),
                catchError(() => {
                    // revert current array changes in case of any error
                    innerPoOrCo.disreactions = hasDisreaction
                        ? innerPoOrCo.disreactions.filter((x) => x.user.id !== currentUser.id)
                        : innerPoOrCo.disreactions.concat({ isDis: true, user: currentUser });

                    return of(innerPoOrCo);
                })
            );
        }



    }


}
