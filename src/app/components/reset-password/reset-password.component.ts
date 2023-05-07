import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PasswordToken } from 'src/app/models/passwordToken';
import { AuthenticationService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';


@Component({
    selector: 'app-reset-password.component.html',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.sass']
})
export class ResetPasswordComponent {
    token: string;


    public password = this.formBuilder.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required, Validators.minLength(6)]
    });


    constructor(
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private userService: UserService,
        private authService: AuthenticationService

    ) { }

    ngOnInit(): void {
        this.token = this.route.snapshot.queryParamMap.get('token');
        console.log('Token:', this.token);
    }
    public onSubmit(): void {
        // this.userService.updateUser()
        const newPassword = this.password.get('password').value;
        const confirmPassword = this.password.get('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            // Вывести сообщение об ошибке или сделать другую обработку
            console.log('Passwords do not match!');
            return;
        }

        // Продолжить выполнение метода, если пароли совпадают

        this.userService.updateUserPass({ password: newPassword, token: this.token }).subscribe(() => {
            console.log('Успех');
        }, () => {
            console.log('Ошибка');
        });;
        console.log(newPassword);

    }
}