const express = require("express");
const router = express.Router();
const User = require("../model/schema"); // import o schema do banco de dados
const multer = require('multer');// multer é um middleware para upload de arquivos'
const fs = require('fs'); // fs é um módulo do node para manipulação de arquivos

//upload de image
const storage = multer.diskStorage({ // configuração do multer, diskStorage é o tipo de armazenamento que será usado
    destination: function (req, file, cb) {
        cb(null, './uploads'); // pasta onde será armazenado o arquivo
    },
    filename: function (req, file, cb) { // filename é o nome do arquivo que será salvo
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname); // nome do arquivo será o nome do campo + data + nome original do arquivo
    },

});


const upload = multer({ // configuração do multer para upload de arquivos
    storage: storage, // armazenamento definido acima
}).single("image"); // single é o tipo de upload, no caso um único arquivo


//inserir um usuário na rota do banco de dados
router.post("/add", upload, (req, res) => {

    const user = new User({
        nome: req.body.nome,
        email: req.body.email,
        Telefone: req.body.Telefone,
        image: req.file.filename,
    });

    user.save((err) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        }
        else {
            req.session.message = {
                type: 'sucesso',
                message: 'Usuário adicionado com sucesso'
            };
            res.redirect('/');
        }
    });

});

// obtém todas as rotas do usuário
router.get("/", (req, res) => {
    User.find().exec((err, users) => {
        if (err) {
            res.json({
                message: err.message
            });
        }
        else {
            res.render('index', {
                title: 'Pagina inicial',
                users: users,
            });
        }
    });
});

router.get("/add", (req, res) => {

    res.render("add_users", { title: "Adicionar usuários" });

});


//editar rota do usuário
router.get("/edit/:id", (req, res) => {
    let id = req.params.id;
    User.findById(id, (err, user) => {

        if (err) {
            res.redirect("/");
        }
        else {
            if (user == null) {
                res.redirect("/");
            }
            else {
                res.render("edit_users", {
                    title: "Edit User",
                    user: user
                });
            }
        }
    });
});

//atualiza a rota do usuário
router.post("/update/:id", upload, (req, res) => {
    let id = req.params.id;
    let new_image = "";
    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image); // deleta a imagem antiga
        }
        catch (err) {
            console.log(err);
        }

    }
    else {
        new_image = req.body.old_image;

    }

    User.findByIdAndUpdate(id, { // atualiza o usuário
        nome: req.body.nome,
        email: req.body.email,
        Telefone: req.body.Telefone,
        image: new_image,
    }, (err, result) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        }
        else {
            req.session.message = {
                type: "sucesso",
                message: "Usuário atualizado com sucesso!"
            };
            res.redirect("/");
        }
    });

});

//deleta a rota do usuário
router.get("/delete/:id", (req, res) => {

    let id = req.params.id;
    User.findByIdAndRemove(id, (err, result) => { // deleta o usuário
        if (result.image != '') {
            try {
                fs.unlinkSync("./uploads/" + result.image); // deleta a imagem do usuário

            }
            catch (err) {
                console.log(err);
            }
        }
        if (err) {
            res.json({
                message: err.message
            });
        }
        else {
            req.session.message = {
                type: 'info',
                message: "User Deleted Successfully!"
            };
            res.redirect("/");
        }
    });

});


module.exports = router;