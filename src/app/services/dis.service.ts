import { Injectable } from '@angular/core';
import { AuthenticationService } from './auth.service';
import { Post } from '../models/post/post';
import { PostService } from './post.service';
import { User } from '../models/user';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NewDisreaction } from '../models/disreactions/newDisReaction';

@Injectable({ providedIn: 'root' })
export class DisService {
    public constructor(private authService: AuthenticationService, private postService: PostService) { }

    public disPost(post: Post, currentUser: User) {
        const innerPost = post;

        const disreaction: NewDisreaction = {
            entityId: innerPost.id,
            isDis: true,
            userId: currentUser.id
        };

        // update current array instantly
        let hasDisreaction = innerPost.disreactions.some((x) => x.user.id === currentUser.id);
        innerPost.disreactions = hasDisreaction
            ? innerPost.disreactions.filter((x) => x.user.id !== currentUser.id)
            : innerPost.disreactions.concat({ isDis: true, user: currentUser });
        hasDisreaction = innerPost.disreactions.some((x) => x.user.id === currentUser.id);

        return this.postService.disPost(disreaction).pipe(
            map(() => innerPost),
            catchError(() => {
                // revert current array changes in case of any error
                innerPost.disreactions = hasDisreaction
                    ? innerPost.disreactions.filter((x) => x.user.id !== currentUser.id)
                    : innerPost.disreactions.concat({ isDis: true, user: currentUser });

                return of(innerPost);
            })
        );
    }
}
