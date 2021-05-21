<template>
  <!-- conteúdo de exemplo para visualização -->
  <v-container class="pl-5 pr-5 pt-8 pb-2 mt-8">
    <v-row>
      <v-col cols="4" class="pr-0">
        <v-card outlined>
          <v-card>
            <v-card-title class="subtitle-2 font-weight-bold add pb-6 pt-5"
            >
            Adicionar
              </v-card-title>
            <v-divider class="px-5 mx-4"></v-divider>
            <v-card-title class="subtitle-2 font-weight-bold"
              >Variáveis</v-card-title
            >
            <v-chip-group column class="pl-3">
              <v-chip
                color="#F8F9FA"
                draggable
                class="chipsVariable py-5"
                v-for="variable in variables"
                @click="addItemToFormula(variable)"
                :key="variable.name"
                label
              >
                {{ variable.name }}
              </v-chip>
            </v-chip-group>
          </v-card>
          <v-card>
            <v-card-title class="subtitle-2 font-weight-bold"
              >Funções</v-card-title
            >
            <v-chip-group column class="pl-3">
              <v-chip
                color="#F8F9FA"
                draggable
                class="chipsFunction py-5 justify-center"
                v-for="func in functions"
                :key="func.name"
                @click="openDialogFunction(func)"
                label
              >
                {{ func.name }}
              </v-chip>
            </v-chip-group>
          </v-card>
          <v-card>
            <v-card-title class="subtitle-2 font-weight-bold"
              >Operadores Aritméticos</v-card-title
            >
            <v-chip-group column class="pl-3">
              <v-chip
                color="#F8F9FA"
                draggable
                class="chipsAritmetic py-5 justify-center"
                v-for="arit in arithmetic"
                :key="arit.name"
                @click="addItemToFormula(arit)"
                label
              >
               <v-icon>{{arit.icon}}</v-icon> {{ arit.name }}
              </v-chip>
            </v-chip-group>
          </v-card>
          <v-card>
            <v-card-title class="subtitle-2 font-weight-bold"
              >Operadores Lógicos</v-card-title
            >
            <v-chip-group column class="pl-3">
              <v-chip
                color="#F8F9FA"
                draggable
                class="logicalOperators py-5 justify-center"                
                v-for="logic in logical"
                :key="logic.name"
                @click="addItemToFormula(logic)"
                label
              >
                {{ logic.name }}
              </v-chip>
            </v-chip-group>
          </v-card>
        </v-card>
      </v-col>
      <v-col cols="8" class="pl-0">
        <v-card outlined class="flex-row">
          <v-card-title class="subtitle-1 bg-black py-4">
            <v-row>
              <v-col cols="6" class="title"> Montar fórmula </v-col>
              <v-col cols="3" class="pr-0 d-flex justify-end"> </v-col>
              <v-col cols="3" class="pl-0 d-flex justify-end">
                <v-btn
                  color="white"
                  @click="testFormula = true"
                  outlined
                  v-show="itemsFormula.length > 0 ? true : false"
                  class="mx-2 buttons"
                >
                  <v-icon left> mdi-checkbox-marked-circle-outline </v-icon
                  >
                  Validar fórmula
                </v-btn>
                <v-btn
                  color="white"
                  @click="resetData('resetAll')"
                  outlined
                  class="buttons"
                >
                  Limpar
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-divider></v-divider>
          <v-row class="ml-1">
            <v-col cols="12">
              <v-row class="mt-2 mb-2">
                <v-chip color="transparent" label class="parenthesis"> ( </v-chip>
              </v-row>
              <v-row>
                <v-chip-group>
                  <v-chip
                    v-for="(item, i) in itemsFormula"
                    :key="item.name + i"
                    :color="item.color"
                    :value="item.value"
                    class="ml-2 mr-2 chipsFormula justify-center"
                    label
                    outlined
                    @click="removeItemFromFormula(item)"
                  >
                    <v-icon v-if="item.icon"> {{item.icon}} </v-icon> {{ item.name }}
                  </v-chip>
                </v-chip-group>
              </v-row>
              <v-row class="mt-5 mb-2">
                <v-chip color="transparent" label class="parenthesis"> ) </v-chip>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
        <v-alert type="error" v-show="errorMessage">
          {{ message }}
        </v-alert>
        <v-alert type="success" v-show="successMessage">
          {{ message }}
        </v-alert>
        <v-dialog v-model="showDialog" persistent max-width="400">
          <v-card>
            <v-card-title>Adicionar função à fórmula</v-card-title>
            <v-select
              class="mt-10 mb-10 mr-5 ml-5"
              v-model="selectedVariables"
              :items="variablesToSelect"
              label="Selecione"
              multiple
              hint="Selecione as variáveis para compor a função"
              persistent-hint
            ></v-select>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue darken-1"
                outlined
                tile
                @click="(showDialog = false), processVariablesToFormula()"
              >
                Salvar
              </v-btn>
              <v-btn
                color="red darken-1"
                outlined
                tile
                @click="(showDialog = false), (selectedVariables = [])"
              >
                Fechar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-row align="center" justify="center" class="mt-10">
          <h3>Fórmula:</h3>
          <div
            class="formula"
            v-for="(item, i) in itemsFormula"
            :key="item.variable + i"
          >
            {{ item.variable }}
          </div>
        </v-row>
        <v-row align="center" justify="center" class="mt-10">
        <v-dialog v-model="result" max-width="400">
          <v-card>
            <v-card-title>Resultado da Fórmula</v-card-title>
            <v-divider> </v-divider>
            <v-row class="mt-5 mb-5 mx-0">
              <v-col cols="12" class="pl-7">
                <h3>O resultado é: {{ resultFormula }}</h3>
              </v-col>
            </v-row>
            <v-divider> </v-divider>
            <v-card-actions>
              <v-btn @click="result = false" tile outlined color="red"> Fechar </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        </v-row>
        <v-row align="center" justify="center" class="mt-10">
          <v-dialog v-model="testFormula" persistent max-width="600">
            <v-card>
              <v-card-title class="font-weight-bold titleTest">Testar/salvar fórmula</v-card-title>
              <v-divider class="pt-2 pb-2"> </v-divider>
              <v-row v-for="variableIn in variablesAux" :key="variableIn.name" class="mx-0 px-0">
                <v-col cols="3">
                  <v-subheader outlined class="subheader pr-0">{{ variableIn.from }}</v-subheader>
                </v-col>
                <v-col cols="8">
                  <v-text-field
                    label="Defina o valor da variável"
                    value=""
                    outlined
                    tile
                    v-model="variableIn.value"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-card-actions class="pt-3 pb-5">
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  tile
                  outlined
                  @click="(testFormula = false), salvarFormula()"
                >
                  Validar e salvar fórmula
                </v-btn>
                <v-btn
                  outlined
                  color="blue darken-1"
                  tile
                  @click="(testFormula = false), testarFormula('test')"
                >
                  Testar
                </v-btn>
                <v-btn color="red darken-1" outlined tile @click="testFormula = false">
                  Fechar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
  <!-- FIM de exemplo conteúdo para visualização -->
</template>

<script type="text/javascript" src="./script.js" />
<style>
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
</style>
<style scoped lang="scss" src="./style.scss" />
