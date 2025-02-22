const usuario = require("./models/usuario")

const Ong = require("./models/Ong")

const produtos = require("./models/cadastroProdutos")

const pessoa = require("./models/pessoa")

const faleConosco = require("./models/faleConosco")

//----------------------------FINAL--------------------

//para fazer o relacionamento
//usuario.belongsTo(pessoa,{foreignkey: "Pessoaid", allowNull: true})

//criptografia de dados utilizando a ferramenta chamada criptoJS
const crypto = require("crypto-md5");

const notificar = require("./controler/notificar")

//contante responsavél pela conexão com o express. 
const express = require("express")
const app = express()

//configuração do multer que serve para fazer upload de arquivos, imagens etc
const multer= require("multer")

//constantes responsaveis pela ospedagem do handleBars com express e body-parser.
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser");

//configuração handlebars para criar o main.
app.engine('handlebars', handlebars({defaultLayout:'main'}))
app.set("view engine",'handlebars')

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//Multer para fazer os upload das imagens
const storage  = multer.diskStorage({
       destination:(req,file,cb) =>{cb(null, 'public/img')},
       filename:(req,file,cb) => {cb(null,file.originalname)}
})

const upload = multer({storage})

//>>>>>>>>>>>>>>>CONFIGURAÇÃO DO SESSION PARA CRIAR AS SESSÕE<<<<<<<<<<<<
var session = require('express-session');

app.use(session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
}));
//------------------------FINAL DAS CONFIGURAÇÕES DO SESSION--------------------

//>>>>>>>>>>>>CONFIGURAÇÃO DO NODEMAILER PARA ENVIO DE EMAIL<<<<<<<<<<<<<<<
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth:{
                user: "",
                pass: ""   
                    
        },
        tls: { rejectUnauthorized: false}
});

const mailOptions = {
        from: 'eduardomeneghettitec@gmail.com',
        to: 'jonatanbrunotec@gmail.com',
        subject: 'E-mail foi enviado, eai recebeu?',
        text: 'Bem facil né!'
};

transporter.sendMail(mailOptions, function(error, info){
        if(error){
                console.log(error)
        }else{'email enviado:' + info.response};
});
//-------------------FIM DA CONFIGURAÇÃO DO NODEMILER---------------------

// Rota para se fazer possivel o CSS e colocar as imagens
app.use('/static', express.static(__dirname + '/public'));


//>>>>>>> ROTAS DO SITE<<<<<<<<<<<<

//>>>>>>>ROTA DA HOME/INICIO<<<<<<<<<
app.get("/", function(req,res){
        if(req.session.cpf != undefined){
                pessoa.findAll({where:{cpf: req.session.cpf}}).then(function(pessoas){
                res.render("template1",{pessoas: pessoas.map(pagamento => pagamento.toJSON())})
        })
        }else{
        res.render("template1")
        }   
})

app.get('/template1',function(req,res){
        res.render("template1")
})
//------------------fIM DA ROTA DE HOME/INICIO----------------------

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>ROTA MEU PERFIL<<<<<<<<<<
app.get("/meuPerfil", function(req,res){
if(req.session.usuario != undefined && req.session.tipo_1 == 'Ong'){
        usuario.findAll({
                where:{"usuario": req.session.usuario}
        }).then(function(doadores){ 
                res.render('meuPerfil',{doador: doadores.map(pagamento =>pagamento.toJSON())})
        })
}else{
        if(req.session.usuario != undefined && req.session.tipo_1 == 'doador'){
                usuario.findAll({
                        where:{"usuario": req.session.usuario}
                }).then(function(ong){
                        res.render('meuPerfil2',{doador: ong.map(pagamento =>pagamento.toJSON())})
                })
                        }else{
                                res.render('login', {mensagem: "Desculpe, Perfil não econtrado, tente fazer o login novamente!"})
                        }      
        }
})


//>>>>>>>>>>>>>>>>>ROTAS DOS CADASTROS DE USUARIO, DOADOR, ONG, PESSOA E PRODUTOS<<<<<<<<<<<<<<<<<<<<<<<
app.get('/escolhaTipo',function(req,res){
        res.render("escolhaTipo")
})

//>>>>>>>>>>>>>>>>>>>>CADASTRO PARA USUARIOS<<<<<<<<<<<<<<<<<<<<<<<<<<
app.get("/cadastroUsuario", function(req,res){
        if(req.session.usuario){
        usuario.findAll({
                where:{"usuario": req.session.usuario}
        }).then(function(doadores){ 
        res.render('cadastroUsuario',{doador: doadores.map(pagamento =>pagamento.toJSON())})
        })
        }else{
        res.render("cadastroUsuario")
        }
})

app.post('/cadDoador',function(req,res){
        usuario.create({
                tipo:req.body.tipo,
                usuario:req.body.usuario,
                senha:req.body.senha,
                Email:req.body.Email,
                cpf:req.body.cpf
        }).then(function(){
                res.render('login')
        }).catch(function(){
                res.send("Erro"+erro)
        })
})
//----------------------------------FIM DA ROTA DE CADASTRO USUARIO----------------------


//>>>>>>>>>>>>>>>>>>>>>>>CADASTRO PARA ONG<<<<<<<<<<<<<<<<<<<
app.get("/cadastroOng", function(req,res){
        if(req.session.usuario){
        usuario.findAll({
                where:{'usuario': req.session.usuario}
            }).then(function(doador){ 
                res.render('cadastroOng',{doador: doador.map(pagamento =>pagamento.toJSON())})
                })}else{
                res.render('cadastroOng')
                }
        })

app.post('/cadOng',upload.single('colocarImagem'), function(req,res){
        if(req.file){
                var imagem = req.file.originalname
        }else{
                 var imagem = "imagemerro.png"
        }
        usuario.create({
                tipo:req.body.tipo,
                usuario: req.body.usuario,
                senha: req.body.senha,
                Email:req.body.Email,
                cnpj:req.body.cnpj,
                cpf:req.body.cpf,
                telefone:req.body.telefone,
                descricao:req.body.descricao,
                colocarImagem:imagem,
        }).then(function(){
                res.render('login')
         }).catch(function(){
                res.send("Erro"+erro)
        })
})
//--------------------------------FIM DA ROTA DE CADASTRO ONG-----------------------


//>>>>>>>>>>>>>>>>CADASTRO DE PRODUTOS<<<<<<<<<<<<<<<<
app.get("/cadastroProdutos", function(req,res){ 
        console.log(req.session.usuario + "veio isso")
        if(req.session.usuario != undefined && req.session.tipo_1 == 'Ong') {
                usuario.findAll().then(function(usuario1){
                res.render('cadastroProdutos', {usuario: usuario1.map(pagameto => pagameto.toJSON())})
                })
        }else{res.render('login', {mensagem: "Somente Organizações não Governamentais tem acesso para cadastrar produtos."})}
       
})

app.post('/cadProdutos', function(req,res){
        produtos.create({
                nomeOng:req.session.usuario,
                categoriaDoacao:req.body.categoriaDoacao,
                nomeProduto:req.body.nomeProduto,
                quantidade:req.body.quantidade,
                prioridade:req.body.prioridade,
                telefone:req.body.telefone
        }).then(function(){
                res.redirect('doacao')
        }).catch(function(){
                res.send("Erro"+erro)
        })
})
//-----------------FIM DA ROTA DE CADPRODUTOS----------------

//>>>>>>>>>>>ROTAS DE DOAÇÃO<<<<<<<<<<<<<<<<<<<<<
app.get("/doacao", function(req,res){
        res.render("doacao")
})

app.get("/alimentos",function(req,res){
        produtos.findAll({
                where:{'categoriaDoacao': "alimentos" }
            }).then(function(produtos){ 
                res.render('alimentos',{produtos: produtos.map(pagamento =>pagamento.toJSON())})
                })
})

app.get("/brinquedos",function(req,res){
        produtos.findAll({
        where:{'categoriaDoacao': "brinquedos" }
            }).then(function(produtos){ 
                res.render('brinquedos',{produtos: produtos.map(pagamento =>pagamento.toJSON())})
                })
})

app.get("/roupas",function(req,res){
        produtos.findAll({
         where:{'categoriaDoacao': "roupas" }
            }).then(function(produtos){ 
                res.render('roupas',{produtos: produtos.map(pagamento =>pagamento.toJSON())})
                 })
})

app.get("/dinheiro",function(req,res){
        produtos.findAll({
         where:{'categoriaDoacao': "doacaoEmDinheiro" }
                }).then(function(produtos){ 
                  res.render('dinheiro',{produtos: produtos.map(pagamento =>pagamento.toJSON())})
                })
})

app.get("/animais",function(req,res){
        produtos.findAll({
         where:{'categoriaDoacao': "animais" }
           }).then(function(produtos){ 
                   res.render('animais',{produtos: produtos.map(pagamento =>pagamento.toJSON())})
                  })
})
//------------------FIM DAS ROTAS DE DOAÇÕES---------------------------

//>>>>>>Rota para nossas Ong<<<<<<<<<<
app.get("/nossasOng", function(req,res){
          usuario.findAll({
                where:{'tipo': "Ong" }
            }).then(function(doador){ 
                res.render('nossasOng',{doador: doador.map(pagamento =>pagamento.toJSON())})
                })
        })
//------------Final de nossas Ongs-------------


app.get("/novo", function(req,res){
        if(req.session.idUsuario != undefined){
        res.render("nossasOng")
        }else{
                res.redirect("/")
        }
        res.render("cadastroUsuario")
})



//>>>>>>>>>>>>>>>>>ROTAS PARA EFETUAR O LOGIN<<<<<<<<<<<<<<<<<<<<<<<<
app.get('/login',function(req,res){
        res.render("login")
        req.session.usuariozito = 1
})


app.post('/cadLogin', function(req,res){
        console.log(req.body)
 usuario.count({where: {usuario: req.body.usuario, senha: req.body.senha }}).then(function(dados){
         if(dados >= 1){
         usuario.findAll({where: {usuario: req.body.usuario, senha:req.body.senha}}).then(function(usuarios){
                 nomeUsuario = usuarios.map(pagamento => pagamento.toJSON().usuario)
                 usuarioUm = nomeUsuario.toString();
                 req.session.usuario = usuarioUm;
                 tipo1 = usuarios.map( c => c.toJSON().tipo)
                 tipo = tipo1.toString();
                 req.session.tipo_1 = tipo;
                 console.log('veio da session isso -> ' + req.session.usuario)
                 res.redirect('/template1')
         })
        }else if(req.session.usuariozito == 1){
                res.render("login", {mensagem: "usuário ou senha não existem"})
                req.session.usuariozito ++
        }else{
                res.redirect("login")
        }
        })

});


app.get('/logoff', function(req,res){
        req.session.destroy(function(){
                res.render('template1')
        })
})
//-------------FIM DA ROTA PARA LOGIN-------------------------------

//>>>>>>>>>>>>ROTA PARA O FALE CONOSCO<<<<<<<<<
app.get("/faleConosco", function(req,res){
        res.render("faleConosco")
})

app.post("/cadFaleConosco", function(req,res){
        faleConosco.create({
                nomeSolicitante:req.body.nomeSolicitante,
                emailSolicitante:req.body.emailSolicitante,
                textoSolicitante:req.body.textoSolicitante
        }).then(function(){
                res.render("template1")
        }).catch(function(){
                res.send("Erro"+erro)
        })
})

//----------------------FINAL FALE CONOSCO-------------------


//este bloco é responsavél por deletar os cadastro de seus respectivos formularios 
app.post('/delete', function(req,res){
        usuario.destroy({
                where:{'id': req.body.id}
            }).then(function(){
                usuario.findAll().then(function(doadores){
                    res.render('cadastroUsuario', {doador: doadores.map(pagamento => pagamento.toJSON())})
                })
        
            .catch(function(){res.send("não deu certo")})
            })
    })

app.post('/delete1', function(req,res){
        usuario.destroy({
                where:{'id': req.body.id, 'tipo': 'Ong'}
            }).then(function(){
                usuario.findAll().then(function(doadores){
                    res.render('cadastroOng', {doador: doadores.map(pagamento => pagamento.toJSON())})
                })
        
            .catch(function(){res.send("não deu certo")})
            })
    })

 app.post('/apaga1', function(req,res){
        produtos.destroy({
            where:{'id': req.body.id}
        }).then(function(){
        produtos.findAll().then(function(produtos){
                res.render('cadastroProdutos', {produtos: produtos.map(pagamento => pagamento.toJSON())})
            })
    
        .catch(function(){res.send("não deu certo")})
        })
    })
//-------------------------------------- Fim dos delete -----------------------------------------------

//este bloco é responsavel por modificar/alterar os cadastros de seus respectivos formularios/tabelas.
app.get('/update/:id', function(req,res){
        usuario.findAll({ where:{'id': req.params.id}}).then(function(doadores){
                res.render('atualiza',{doador: doadores.map(pagamento => pagamento.toJSON())})
        })
})

app.get('/updateProdutos/:id', function(req,res){
        produtos.findAll({ where:{'id': req.params.id}}).then(function(produtos){
                res.render('atualizaProdutos',{produtos: produtos.map(pagamento => pagamento.toJSON())})
        })
})

app.get("/listaOng/:nomeOng", function(req,res){
       produtos.findAll({
               where: {'nomeOng' : req.params.nomeOng}
        }).then(function(produto){
                res.render('listaOng',{produto: produto.map(pagamento => pagamento.toJSON())})
        })
})


app.post('/updateUsuario', function(req,res){
        usuario.update({usuario: req.body.usuario, senha:req.body.senha},{
                where:{id:req.body.codigo}}
        ).then(function(){
                usuario.findAll().then(function(doadores){
                res.render('cadastroUsuario',{doador: doadores.map(pagamento => pagamento.toJSON())})

                }).catch(function(erro){
                        res.send("Erro "+erro)
                })
        })
         
        
})


app.post('/updateProdutos', function(req,res){
        produtos.update({ categoriaDoacao:req.body.categoriaDoacao, nomeProduto:req.body.nomeProduto,},{
                where:{id:req.body.codigo}}
        ).then(function(){
                produtos.findAll().then(function(produtos){
                res.render('cadastroProdutos',{produtos: produtos.map(pagamento => pagamento.toJSON())})

                }).catch(function(erro){
                        res.send("Erro "+erro)
                })
        })
         
        
})
//------------------------fim dos update---------------------------------------------

//porta em qual o sistema está rodando

app.listen(3000);
