class ApplicationTitleEmptyException(Exception):
    def __init__(self, message: str = "Название заявки не может быть пустым"):
        self.message = message
        super().__init__(self.message)


class ApplicationTitleWrongLengthException(Exception):
    def __init__(self, message: str = "Название заявки должно содержать от 3 до 120 символов"):
        self.message = message
        super().__init__(self.message)


class ApplicationDescTooLongException(Exception):
    def __init__(self, message: str = "Описание заявки не должно превышать 1000 символов"):
        self.message = message
        super().__init__(self.message)


class ApplicationIsDoneException(Exception):
    def __init__(self, message: str = "Заявка уже отмечена завершённой"):
        self.message = message
        super().__init__(self.message)


class ApplicationNotExistsException(Exception):
    def __init__(self, message: str = "Такой заявки не существует"):
        self.message = message
        super().__init__(self.message)


class UserUsernameEmptyException(Exception):
    def __init__(self, message: str = "Необходимо указать непустой юзернейм пользователя"):
        self.message = message
        super().__init__(self.message)


class UserUsernameLengthException(Exception):
    def __init__(self, message: str = "Юзернейм пользователя должен содержать от 1 до 64 символов"):
        self.message = message
        super().__init__(self.message)


class UserUsernameExistsException(Exception):
    def __init__(self, message: str = "Пользователь с таким юзернеймом уже существует"):
        self.message = message
        super().__init__(self.message)


class UserNotExistsException(Exception):
    def __init__(self, message: str = "Неверный логин или пароль"):
        self.message = message
        super().__init__(self.message)


class CredentialException(Exception):
    def __init__(self, message: str = "Недействительный токен"):
        self.message = message
        super().__init__(self.message)
